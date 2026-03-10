/**
 * Jira Cloud integration — fetch an issue by URL and convert it to Markdown.
 *
 * Two paths:
 *   1. API-key path (primary) — email + apiToken configured → direct REST API call,
 *      ADF description converted to proper Markdown for rich spec generation.
 *   2. No-credentials path (fallback) — callers handle via VS Code file-picker /
 *      input-box so users can paste or import any Markdown content themselves.
 */

export interface JiraIssueResult {
  key: string;
  summary: string;
  /** Full Markdown representation of the issue, ready to use as spec description. */
  markdown: string;
  issueType: string;
}

export interface JiraConfig {
  baseUrl?: string;
  email?: string;
  apiToken?: string;
}

/** Returns true when API credentials are fully configured. */
export function hasJiraCredentials(config: JiraConfig): boolean {
  return Boolean(config.email?.trim() && config.apiToken?.trim());
}

/**
 * Parse a Jira browse URL to extract host and issue key.
 * Supports: https://domain.atlassian.net/browse/PROJ-123
 * Returns null if not a valid Jira URL.
 */
export function parseJiraUrl(url: string): { host: string; issueKey: string } | null {
  const trimmed = url.trim();
  const m = trimmed.match(/^https?:\/\/([^/]+)\/browse\/([A-Z][A-Z0-9]+-\d+)/i);
  if (m) {
    return { host: m[1], issueKey: m[2].toUpperCase() };
  }
  return null;
}

// ── ADF → Markdown ────────────────────────────────────────────────────────────

/** Partial Atlassian Document Format node shape. */
interface AdfNode {
  type?: string;
  text?: string;
  content?: AdfNode[];
  attrs?: Record<string, string | number | boolean | null>;
  marks?: Array<{ type: string; attrs?: Record<string, string> }>;
}

function adfToMarkdown(node: AdfNode | string | null | undefined, depth = 0): string {
  if (node == null) return '';
  if (typeof node === 'string') return node;

  const children = (n: AdfNode) =>
    (n.content ?? []).map((c) => adfToMarkdown(c, depth)).join('');

  switch (node.type) {
    case 'doc':
      return (node.content ?? []).map((c) => adfToMarkdown(c, depth)).join('\n');

    case 'paragraph':
      return children(node).trim() + '\n';

    case 'text': {
      let t = node.text ?? '';
      if (node.marks) {
        for (const mark of node.marks) {
          if (mark.type === 'strong') t = `**${t}**`;
          else if (mark.type === 'em') t = `_${t}_`;
          else if (mark.type === 'code') t = `\`${t}\``;
          else if (mark.type === 'strike') t = `~~${t}~~`;
          else if (mark.type === 'link' && mark.attrs?.href) t = `[${t}](${mark.attrs.href})`;
        }
      }
      return t;
    }

    case 'heading': {
      const level = Number(node.attrs?.level ?? 2);
      const prefix = '#'.repeat(Math.max(1, Math.min(level, 6)));
      return `${prefix} ${children(node).trim()}\n`;
    }

    case 'bulletList':
      return (node.content ?? []).map((c) => adfToMarkdown(c, depth + 1)).join('');

    case 'orderedList': {
      let i = Number(node.attrs?.order ?? 1);
      return (node.content ?? [])
        .map((c) => {
          const text = (c.content ?? []).map((n) => adfToMarkdown(n, depth + 1)).join('').trim();
          return `${i++}. ${text}\n`;
        })
        .join('');
    }

    case 'listItem': {
      const indent = '  '.repeat(depth - 1);
      const text = (node.content ?? []).map((c) => adfToMarkdown(c, depth)).join('').trim();
      return `${indent}- ${text}\n`;
    }

    case 'codeBlock': {
      const lang = String(node.attrs?.language ?? '');
      const code = children(node);
      return `\`\`\`${lang}\n${code}\n\`\`\`\n`;
    }

    case 'blockquote':
      return (node.content ?? [])
        .map((c) => adfToMarkdown(c, depth))
        .join('')
        .split('\n')
        .map((l) => (l ? `> ${l}` : '>'))
        .join('\n') + '\n';

    case 'rule':
      return '---\n';

    case 'hardBreak':
      return '  \n';

    default:
      return children(node);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch a Jira issue and return it as a Markdown string.
 * Accepts any issue type (Story, Bug, Task, Epic, etc.).
 * Throws a user-readable Error on auth failures or missing issues.
 */
export async function fetchJiraIssueAsMarkdown(
  jiraUrl: string,
  config: JiraConfig
): Promise<JiraIssueResult> {
  const parsed = parseJiraUrl(jiraUrl);
  if (!parsed) {
    throw new Error(
      'Invalid Jira URL. Use a browse link, e.g. https://your-domain.atlassian.net/browse/PROJ-123'
    );
  }

  const baseUrl = config.baseUrl || `https://${parsed.host}`;
  const apiUrl = `${baseUrl.replace(/\/$/, '')}/rest/api/3/issue/${parsed.issueKey}`;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (config.email && config.apiToken) {
    const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');
    headers.Authorization = `Basic ${auth}`;
  }

  const res = await fetch(apiUrl, { method: 'GET', headers });

  if (!res.ok) {
    if (res.status === 401)
      throw new Error(
        'Jira authentication failed. Check Settings → nSpec → Jira email and API token.'
      );
    if (res.status === 404)
      throw new Error(`Jira issue ${parsed.issueKey} not found or you don't have access.`);
    throw new Error(`Jira request failed (${res.status}). Check the URL and Jira settings.`);
  }

  const data = (await res.json()) as {
    key?: string;
    fields?: {
      summary?: string;
      description?: AdfNode;
      issuetype?: { name?: string };
    };
  };

  const key = data.key || parsed.issueKey;
  const fields = data.fields ?? {};
  const issueType = (fields.issuetype?.name ?? '').trim();
  const summary = (fields.summary ?? '').trim();

  const lines: string[] = [`# ${key}: ${summary}`];
  if (issueType) lines.push(`\n**Type:** ${issueType}`);

  if (fields.description) {
    const body = adfToMarkdown(fields.description).trim();
    if (body) lines.push('\n' + body);
  }

  return { key, summary, markdown: lines.join('\n'), issueType };
}
