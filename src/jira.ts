/**
 * Jira Cloud integration: fetch issue by URL and validate it is a user story.
 * Used as an alternative to free-text description when creating a spec from a Jira ticket.
 */

const JIRA_STORY_NAMES = ['story', 'user story'];

export interface JiraIssueResult {
  key: string;
  summary: string;
  description: string;
  issueType: string;
}

export interface JiraConfig {
  baseUrl?: string;
  email?: string;
  apiToken?: string;
}

/**
 * Parse a Jira browse URL to extract host and issue key.
 * Supports: https://domain.atlassian.net/browse/PROJ-123 or https://domain.atlassian.net/jira/software/projects/PROJ/boards/1?jql=...
 * Returns null if not a valid Jira URL we can use for API.
 */
export function parseJiraUrl(url: string): { host: string; issueKey: string } | null {
  const trimmed = url.trim();
  const browseMatch = trimmed.match(/^https:\/\/([^/]+)\/browse\/([A-Z][A-Z0-9]+-\d+)/i);
  if (browseMatch) {
    return { host: browseMatch[1], issueKey: browseMatch[2].toUpperCase() };
  }
  return null;
}

/** Partial Atlassian Document Format node shape. */
interface AdfNode {
  type?: string;
  text?: string;
  content?: AdfNode[];
}

/**
 * Convert Atlassian Document Format (ADF) description to plain text.
 * Handles common node types: paragraph, text, heading, listItem, bulletList, orderedList, codeBlock.
 */
function adfToPlainText(node: AdfNode | string | null | undefined): string {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (node.text) return node.text;
  if (!Array.isArray(node.content)) return '';
  return node.content.map((c) => adfToPlainText(c)).join('');
}

/**
 * Fetch a Jira issue by URL. Validates that the issue type is a User Story (or Story);
 * otherwise throws with a message suitable for the user.
 */
export async function fetchJiraIssueAsUserStory(
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

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (config.email && config.apiToken) {
    const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');
    headers.Authorization = `Basic ${auth}`;
  }

  const res = await fetch(apiUrl, { method: 'GET', headers });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(
        'Jira authentication failed. Check Settings → nSpec → Jira email and API token.'
      );
    }
    if (res.status === 404) {
      throw new Error(`Jira issue ${parsed.issueKey} not found or you don't have access.`);
    }
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
  const fields = data.fields || {};
  const issueType = (fields.issuetype?.name || '').trim();
  const typeLower = issueType.toLowerCase();

  const isStory = JIRA_STORY_NAMES.some((name) => typeLower === name);
  if (!isStory) {
    throw new Error(
      `Only Jira user stories are supported. This issue is a "${issueType}". Use a Story/User Story or enter a description instead.`
    );
  }

  const summary = (fields.summary || '').trim();
  let description = '';
  const descNode = fields.description;
  if (descNode) {
    description = adfToPlainText(descNode).trim();
  }

  return {
    key,
    summary,
    description,
    issueType,
  };
}

/**
 * Build a single prompt string from a Jira user story (for use as the initial spec description).
 */
export function jiraIssueToPrompt(issue: JiraIssueResult): string {
  const parts = [`# ${issue.key}: ${issue.summary}`];
  if (issue.description) {
    parts.push('', issue.description);
  }
  return parts.join('\n');
}
