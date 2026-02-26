# nSpec

> **Spec-driven development for VS Code and Cursor.**  
> Turn a feature description into a traceable **Requirements → Design → Tasks → Verify** pipeline — then execute tasks with AI-reviewed diffs.

[![Version](https://img.shields.io/badge/version-0.2.0-blue)](https://github.com/nspec/nSpec/releases)
[![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.93.0-007ACC)](https://marketplace.visualstudio.com/items?itemName=awilliams.nSpec)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## What is nSpec?

Most AI coding tools jump straight to code. nSpec makes you **plan first**.

You describe a feature. nSpec generates a structured spec — functional requirements, architecture design, a checkbox task list, and a verification report — all traceable back to each other. Then you execute tasks one at a time, reviewing every diff before it applies.

**The result:** AI-generated code you actually understand, with a paper trail showing *why* each decision was made.

---

## How it works

```
Describe feature  →  Requirements  →  Design  →  Tasks  →  Verify
                         FR-1..N      components  ☐ T-1    health score
                                      data models  ☐ T-2    gap report
                                                   ☐ T-3
```

Each stage feeds the next. If requirements change, cascade regenerates everything downstream automatically.

---

## Screenshots

> **Tip for contributors:** Replace each placeholder below with an actual screenshot once the extension is installed.

### The nSpec Panel

<!-- screenshot: panel open showing Requirements stage with FR list -->
*The main panel showing a generated requirements stage. Open with `Ctrl+Shift+K`.*

### Generating a Spec

<!-- screenshot: "New Spec" input box in command palette -->
*Run `nSpec: New Spec` from the Command Palette, enter a feature description, and the pipeline generates automatically.*

### Design Stage

<!-- screenshot: design.md rendered in the panel with architecture sections -->
*The Design stage renders architecture, component breakdown, and data models derived from your requirements.*

### Task Execution with Diff Review

<!-- screenshot: diff editor showing a proposed file change with Accept/Reject buttons -->
*Each AI-proposed change opens in VS Code's diff editor. Accept or reject per file before anything touches your codebase.*

### Verify Health Score

<!-- screenshot: verify.md panel showing score 87/100 with coverage matrix -->
*The Verify stage scores your spec 0–100 and shows a coverage matrix mapping every requirement to a task.*

### OpenSpec Customization

<!-- screenshot: _prompts/ folder in Explorer with a custom requirements.md override -->
*Override AI prompts per-stage or per-spec by dropping Markdown files into `_prompts/`.*

### Steering Files

<!-- screenshot: .specs/steering/ folder with product.md and tech.md open -->
*Steering files inject persistent project context — tech stack, conventions, business rules — into every prompt.*

### AI Model Selection

<!-- screenshot: quick-pick dropdown from "nSpec: Select AI Model" showing gpt-4o, claude-sonnet, etc. -->
*Pick any OpenAI or Anthropic model interactively via `nSpec: Select AI Model`.*

---

## Quick start

> **The only required setting is your API key.**  
> Set `nspec.apiKey` in VS Code Settings and everything else uses a working default.

### VS Code + OpenAI Codex (recommended)

1. Install nSpec: **Extensions → ⋯ → Install from VSIX** → pick `nSpec-*.vsix`.
2. Open **Settings** (`Ctrl+,`) → search **nspec** → set **API Key** to your OpenAI key (`sk-...`).
3. Press **Ctrl+Shift+K** (Windows/Linux) or **Cmd+Shift+K** (Mac) to open the panel.
4. Run **nSpec: New Spec** from the Command Palette — describe your feature and press Enter.

The default model is `gpt-4o` and specs are stored in `.specs/`. No further configuration needed.

> **Rovo MCP (optional):** Set `nspec.rovoMcpConfigPath` to your `config.toml` path and nSpec will automatically enrich specs with live Jira, Confluence, and agent context.

---

### Cursor

1. Install nSpec: **Extensions → ⋯ → Install from VSIX** → pick `nSpec-*.vsix`.
2. Open **Settings** (`Ctrl+,`) → search **nspec** → set **API Key** to your OpenAI or Anthropic key.
   - OpenAI: `sk-...`
   - Anthropic: `sk-ant-...` → also set **API Base URL** to `https://api.anthropic.com/v1` and **Model** to e.g. `claude-sonnet-4-20250514`
3. Press **Ctrl+Shift+K** to open the panel.

> **Tip:** Run **nSpec: Select AI Model** from the Command Palette to pick from available models interactively.

---

### Building from source

```bash
git clone https://github.com/nspec/nSpec.git
cd nSpec
npm install
npm run package          # produces nSpec-*.vsix
```

Install the `.vsix` via **Extensions → ⋯ → Install from VSIX**.

---

## Usage

| Action | How |
|--------|-----|
| Open panel | **Ctrl+Shift+K** / **Cmd+Shift+K**, or Command Palette: **nSpec: Open Panel** |
| Create a spec | Command Palette: **nSpec: New Spec** → enter name + description |
| Navigate stages | Breadcrumb in the panel: **1 Requirements › 2 Design › 3 Tasks › 4 Verify** |
| Refine a stage | Type feedback in the Refine bar beneath any stage → press **Refine** |
| Cascade downstream | Press **Cascade** to regenerate all stages below the current one |
| Run tasks (supervised) | Click **Run all tasks** in the Tasks stage — review each diff before it applies |
| Check task completion | Command Palette: **nSpec: Check Task Completion** |
| Custom prompts | Click the **✦ OpenSpec** badge in the breadcrumb to scaffold `_prompts/` |
| Setup steering | Command Palette: **nSpec: Setup Steering Files** |

---

## CLI

The CLI is designed for agent-driven workflows (Claude Code, Codex, scripts). It reads `NSPEC_API_KEY` from the environment.

### Setup

```bash
# Copy and fill in your API key
cp .env.example .env
# or export directly:
export NSPEC_API_KEY="sk-..."          # OpenAI
export NSPEC_API_KEY="sk-ant-..."      # Anthropic
export NSPEC_API_BASE="https://api.anthropic.com/v1"
export NSPEC_MODEL="claude-sonnet-4-20250514"
```

### Commands

```bash
node bin/nspec.mjs init <name>                         # Create an empty spec
node bin/nspec.mjs generate <name> requirements \
  --description "Build a user auth system..."          # Generate one stage
node bin/nspec.mjs cascade <name>                      # Generate design → tasks → verify
node bin/nspec.mjs verify <name> --scheme committee    # Thorough verification (best quality)
node bin/nspec.mjs refine <name> <stage> \
  --feedback "Add rate limiting requirements"          # Revise a stage
node bin/nspec.mjs status                              # List all specs
node bin/nspec.mjs status <name>                       # Detail view with health score
node bin/nspec.mjs check-tasks <name>                  # Scan codebase for task completion
node bin/nspec.mjs import <name> <stage> <file> \
  --transform                                          # Import & convert an existing doc
```

> The CLI requires `npm run compile` first so `out/core/` exists.

---

## Agent integration

### Claude Code

Three slash commands are registered in `.claude/commands/`:

| Command | What it does |
|---------|-------------|
| `/spec <name>` | Pipe the current conversation to the spec pipeline (requirements → design → tasks → verify) |
| `/spec-status [name]` | Show spec status or health score for a specific spec |
| `/spec-refine <name> <stage>` | Refine a spec stage using conversation feedback |

**Example:**

```
/spec auth-feature
```

Claude Code captures the conversation, runs `vibe-to-spec`, and reports the health score. Set `NSPEC_API_KEY` in your shell before running.

### OpenAI Codex

Use the `@nspec` chat participant in VS Code chat with Codex:

| Command | What it does |
|---------|-------------|
| `@nspec /spec <name>` | Generate a spec from the chat conversation |
| `@nspec /status [name]` | Show spec status |
| `@nspec /refine <name> <stage>` | Refine a spec stage |
| `@nspec /context <name>` | Inject a spec's full content as chat context |

Requires `nspec.apiKey` set to your OpenAI key. When a Rovo MCP connection is configured (`nspec.rovoMcpConfigPath`), Codex can pull live Jira issues, Confluence pages, and agent context directly into spec generation.

**Cross-referencing a spec in chat:**  
Type `spec:<name>` or `#spec:<name>` anywhere in a Codex chat message to inject the spec's requirements, design, and tasks as context:

```
Implement task 3 from spec:user-auth
```

---

## Configuration reference

All settings are under **Settings → nSpec** (search `nspec` in the VS Code settings UI).

| Setting | Default | Description |
|---------|---------|-------------|
| `nspec.specsFolder` | `.specs` | Folder (relative to workspace root) where specs are stored |
| `nspec.apiKey` | — | OpenAI or Anthropic API key. Required for VS Code + Codex and CLI usage. |
| `nspec.apiBaseUrl` | `https://api.openai.com/v1` | API base URL. For Anthropic: `https://api.anthropic.com/v1`. For local Ollama: `http://localhost:11434/v1`. |
| `nspec.apiModel` | `gpt-4o` | Model name. Examples: `gpt-4o`, `claude-sonnet-4-20250514`, `llama3`. |
| `nspec.preferredModelId` | — | VS Code model ID. Set via **nSpec: Select AI Model** command. |
| `nspec.allowedCommands` | `["npm install","npm run","npx"]` | Command prefixes auto-approved during supervised task execution. All others require manual approval. |
| `nspec.jiraBaseUrl` | — | Jira base URL (e.g. `https://your-domain.atlassian.net`). Optional when using a full Jira browse URL. |
| `nspec.jiraEmail` | — | Email for Jira Cloud API authentication. |
| `nspec.jiraApiToken` | — | Jira Cloud API token. Create one at [Atlassian API tokens](https://id.atlassian.com/manage-profile/security/api-tokens). |
| `nspec.rovoMcpConfigPath` | — | Path to `config.toml` for Rovo MCP. Relative to workspace root. Leave empty to use `.cursor/mcp.json`. |

---

## Spec structure

Each spec lives in `.specs/<name>/`:

```
.specs/
├── <name>/
│   ├── requirements.md      # Functional requirements (Given/When/Then, FR-N)
│   ├── design.md            # Architecture, components, data models
│   ├── tasks.md             # Checkbox task list with effort sizing and FR traceability
│   ├── verify.md            # Health score (0–100), coverage matrix, gap report
│   ├── _progress.json       # Task completion state (survives regeneration)
│   ├── _steering.md         # (optional) Domain context for this spec
│   ├── _role.md             # (optional) Override the AI role
│   └── _prompts/            # (optional) Full prompt overrides per stage
├── steering/                # Workspace-wide steering (product.md, tech.md, etc.)
└── _prompts/                # Workspace-wide prompt overrides
```

---

## OpenSpec customization

Override AI behaviour at any granularity without touching source code.

| File | Scope | What it does |
|------|-------|-------------|
| `.specs/steering/*.md` | All specs | Persistent context injected into every prompt (tech stack, conventions, etc.) |
| `.specs/_prompts/<stage>.md` | All specs | Replace the system prompt for a stage workspace-wide |
| `.specs/<name>/_steering.md` | One spec | Domain context for a specific spec |
| `.specs/<name>/_prompts/<stage>.md` | One spec | Replace the system prompt for one stage |
| `.specs/<name>/_sections/<stage>.md` | One spec | Append extra output sections |
| `.specs/<name>/_role.md` | One spec | Change the AI persona |

Run **nSpec: Setup Steering Files** to auto-generate `product.md`, `tech.md`, and `structure.md` from your workspace.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| **No models found** | Set `nspec.apiKey` to your OpenAI (or Anthropic) key in VS Code or Cursor Settings. |
| **Generation failed** | Check your API key, network connection, and model name. For Anthropic, verify `apiBaseUrl` is set to `https://api.anthropic.com/v1`. |
| **CLI: NSPEC_API_KEY is required** | `export NSPEC_API_KEY="sk-..."` in your shell before running CLI commands. |
| **Panel empty or stale** | Reopen the panel. Make sure a folder is open (File → Open Folder) and `.specs/` exists. |
| **No workspace folder** | Open a folder (File → Open Folder) before creating specs. |
| **Tasks regeneration wiped my checkboxes** | `_progress.json` persists task state independently — checkboxes are restored automatically on next panel open. |

**Logs:** Output panel → select **nSpec** or **nSpec Hooks**.

---

## Security

- **Never commit API keys.** Use VS Code Settings (stored in your user profile, not the workspace) or environment variables for CLI usage. See `.env.example`.
- The `.gitignore` excludes `.env`, `.env.*`, and `*.local.json` by default.
- Supervised task execution requires explicit approval for shell commands not in `nspec.allowedCommands`.

---

## Docs

- **CLI and agent usage:** [AGENTS.md](AGENTS.md)
- **Claude Code slash commands:** [CLAUDE.md](CLAUDE.md)
- **Prompt system:** [PROMPTS.md](PROMPTS.md)
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
