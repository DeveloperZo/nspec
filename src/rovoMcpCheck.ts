/**
 * Check if Rovo MCP (e.g. atlassian-rovo-mcp) is configured for use with Jira integration.
 * If the user sets nspec.rovoMcpConfigPath (e.g. to config.toml), we parse that file (TOML).
 * Otherwise we fall back to .cursor/mcp.json (workspace then global).
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import toml from 'toml';

const ROVO_SERVER_KEYS = ['atlassian-rovo-mcp', 'rovo'];
const MCP_FILENAME = 'mcp.json';
const CURSOR_DIR = '.cursor';

export interface RovoMcpCheckResult {
  configured: boolean;
  source: 'config.toml' | 'workspace' | 'global' | null;
  path: string | null;
}

function hasRovoInServers(servers: unknown): boolean {
  if (!servers || typeof servers !== 'object') return false;
  const keys = Object.keys(servers as Record<string, unknown>);
  return keys.some((k) => ROVO_SERVER_KEYS.includes(k) || k.toLowerCase().includes('rovo'));
}

/**
 * Parse user-pointed config file (TOML). Expects [mcpServers.*] or equivalent with a key containing "rovo".
 */
function checkTomlConfigPath(
  configPath: string,
  workspaceRoot: string | null
): RovoMcpCheckResult | null {
  const resolved = path.isAbsolute(configPath)
    ? configPath
    : workspaceRoot
      ? path.join(workspaceRoot, configPath)
      : null;
  if (!resolved || !fs.existsSync(resolved)) return null;
  try {
    const raw = fs.readFileSync(resolved, 'utf-8');
    const data = toml.parse(raw) as { mcpServers?: unknown };
    if (hasRovoInServers(data?.mcpServers)) {
      return { configured: true, source: 'config.toml', path: resolved };
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

/**
 * Check .cursor/mcp.json (workspace then global).
 */
function checkMcpJson(workspaceRoot: string | null): RovoMcpCheckResult {
  const result: RovoMcpCheckResult = { configured: false, source: null, path: null };
  const candidates: { path: string; source: 'workspace' | 'global' }[] = [];
  if (workspaceRoot) {
    candidates.push({
      path: path.join(workspaceRoot, CURSOR_DIR, MCP_FILENAME),
      source: 'workspace',
    });
  }
  const homedir = os.homedir();
  if (homedir) {
    candidates.push({ path: path.join(homedir, CURSOR_DIR, MCP_FILENAME), source: 'global' });
  }
  for (const { path: mcpPath, source } of candidates) {
    if (!fs.existsSync(mcpPath)) continue;
    try {
      const raw = fs.readFileSync(mcpPath, 'utf-8');
      const data = JSON.parse(raw) as { mcpServers?: Record<string, unknown> };
      if (hasRovoInServers(data?.mcpServers)) {
        result.configured = true;
        result.source = source;
        result.path = mcpPath;
        return result;
      }
    } catch {
      // Ignore
    }
  }
  return result;
}

/**
 * Returns whether Rovo MCP appears to be configured.
 * If configPath is set (e.g. to config.toml), that file is parsed as TOML first.
 * Otherwise falls back to .cursor/mcp.json (workspace then global).
 */
export function isRovoMcpConfigured(
  workspaceRoot: string | null,
  configPath?: string | null
): RovoMcpCheckResult {
  const trimmed = configPath?.trim();
  if (trimmed) {
    const fromToml = checkTomlConfigPath(trimmed, workspaceRoot);
    if (fromToml) return fromToml;
    // User pointed to a file but it didn't have Rovo (or file missing) — still fall back to mcp.json
  }
  return checkMcpJson(workspaceRoot);
}
