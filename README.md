# nSpec v2

Spec-driven development in VS Code and Cursor: **Requirements → Design → Tasks → Verify**. Generate and maintain structured specs with AI, then verify and refine them in one place.

## Requirements

- **Codex extension** — Install the [Codex](https://marketplace.visualstudio.com/items?itemName=Codex.Codex) extension (Cursor / VS Code) for chat integration and task context (e.g. “Run task” sending context to Codex chat).
- **Rovo MCP** — The [Rovo MCP](https://support.atlassian.com/rovo/docs/rovo-dev-and-model-context-protocol-mcp/) server must be configured and enabled. Set **Settings → nSpec → Rovo MCP config path** to your `config.toml` (or leave empty to use `.cursor/mcp.json`). When using a Jira URL, nSpec checks this config for Rovo before continuing.
- **API key** — In **Cursor**, set **Settings → nSpec → API Key** (OpenAI or Anthropic). In **VS Code**, you can use **GitHub Copilot** (sign in) instead; no nSpec API key needed.

## Why nSpec?

- **Structured pipeline** — Turn a short description into requirements (Given/When/Then), then design, task list, and verification in a single flow.
- **Your AI** — Uses GitHub Copilot (VS Code) or your API key (Cursor) so you keep your existing model and policies.
- **OpenSpec** — Override prompts per spec or workspace via `_prompts/` and steering files.
- **Hooks** — Run scripts on save/create/delete (e.g. sync to docs, run tests) with template variables (`${filePath}`, `${specName}`, etc.).
- **Verification** — Built-in verify stage and optional task-completion checks to keep specs and code aligned.

**Screenshots:** Panel and breadcrumb UI (add screenshots when available).

## Quick start

1. **Install**
   ```bash
   cd nSpec-v2
   npm install
   npm run package
   ```
   In VS Code / Cursor: **Extensions → ⋯ → Install from VSIX** → pick `nSpec-*.vsix`.

2. **Open the panel** — **Cmd+Shift+K** (Mac) or **Ctrl+Shift+K** (Windows/Linux), or Command Palette: **nSpec: Open Panel**.

3. **Create a spec** — Command Palette: **nSpec: New Spec** → name + description → requirements generate automatically.

4. **Navigate** — Use the breadcrumb: **1 Requirements › 2 Design › 3 Task list › 4 Verify**.

## Configuration

| Setting | Description |
|--------|-------------|
| `nspec.specsFolder` | Folder for specs (default: `.specs`). |
| `nspec.preferredModelId` | Preferred model; set via **nSpec: Select AI Model**. |
| `nspec.apiKey` | OpenAI or Anthropic API key (required in Cursor if not using Copilot). |
| `nspec.apiBaseUrl` | API base (default: OpenAI; use `https://api.anthropic.com/v1` for Anthropic). |
| `nspec.apiModel` | Model name (e.g. `gpt-4o`, `claude-sonnet-4-20250514`). |
| `nspec.allowedCommands` | Command prefixes auto-approved in supervised task runs. |
| `nspec.jiraBaseUrl` | Optional. Jira base URL (e.g. `https://your-domain.atlassian.net`) when using a Jira link in New Spec. |
| `nspec.jiraEmail` | Email for Jira Cloud API (required to fetch issues from a Jira user story URL in New Spec). |
| `nspec.jiraApiToken` | Jira Cloud API token. Create at [Atlassian API tokens](https://id.atlassian.com/manage-profile/security/api-tokens). |
| `nspec.rovoMcpConfigPath` | Path to `config.toml` (or similar) that defines Rovo MCP. Relative to workspace root. Leave empty to use `.cursor/mcp.json`. |

**VS Code:** Works with **GitHub Copilot** (sign in); no API key needed.  
**Cursor:** Set `nspec.apiKey` (and optionally `apiBaseUrl` / `apiModel`) in Settings (Cmd+, → search “nspec”).

## Troubleshooting

| Issue | What to do |
|------|------------|
| **No models found** | In Cursor: ensure a model is enabled and, if using API, set **Settings → nSpec → API Key**. In VS Code: install and sign in to **GitHub Copilot**. |
| **No workspace folder** | Open a folder (File → Open Folder) before creating or opening specs. |
| **Generation failed** | Check API key, network, and model name. For Cursor, confirm `nspec.apiKey` and base URL/model. |
| **Panel empty or stale** | Use the panel refresh or reopen the panel; ensure `.specs` exists under your workspace root. |

Logs: **Output** panel → choose **nSpec** or **nSpec Hooks**.

## Usage

- **Cmd+Shift+K** — open nSpec panel  
- Command palette: **nSpec: New Spec**, **nSpec: Select AI Model**, **nSpec: Setup Steering Files**, **nSpec: Generate Spec from Conversation**, etc.  
- **OpenSpec:** Click the **✦ OpenSpec** badge in the breadcrumb to scaffold `_prompts/` in your spec folder. Drop `.md` files named `requirements.md`, `design.md`, `tasks.md`, or `verify.md` to override prompts per stage. A `_prompts/` folder at `.specs/_prompts/` applies workspace-wide.  
- Specs are stored at `.specs/<name>/` by default (configurable via `nspec.specsFolder`).

## Docs and changelog

- **Spec system and CLI:** [AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md).  
- **Changelog:** [CHANGELOG.md](CHANGELOG.md).  
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md).

**Accessibility:** Webview panel uses semantic structure; keyboard navigation follows VS Code. For improvements (ARIA, focus, screen readers), open an issue.
