# nSpec

> **Spec-driven development for Cursor and Claude Code.**
> Turn a feature description into a traceable **Requirements → Design → Tasks → Verify** pipeline — then execute tasks with AI-reviewed diffs.

[![Version](https://img.shields.io/badge/version-0.2.0-blue)](https://github.com/nspec/nSpec/releases)
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

## Quick start

### Cursor (panel)

1. **Install:** Extensions panel → `⋯` → **Install from VSIX** → select `nSpec-*.vsix`
2. **Add your key:** `Cmd+,` → search `nspec` → set **API Key** to your Anthropic key (`sk-ant-...`), **API Base URL** to `https://api.anthropic.com/v1`, **Model** to `claude-sonnet-4-20250514`
3. **Open the panel:** `Cmd+Shift+K`
4. **Create a spec:** Click **+ New Spec** → enter a name and feature description

Specs are stored in `.specs/` in your workspace.

### Claude Code (CLI + slash commands)

```bash
# Set your key (add to ~/.bashrc or ~/.zshrc to persist)
export NSPEC_API_KEY="sk-ant-..."
export NSPEC_API_BASE="https://api.anthropic.com/v1"
export NSPEC_MODEL="claude-sonnet-4-20250514"

# Or use a .env file in the project root (see .env.example)
```

Then use the slash commands directly in Claude Code:

```
/spec auth-feature        # generate a spec from this conversation
/spec-status              # list all specs + health scores
/spec-status auth-feature # detail view for one spec
/spec-refine auth-feature requirements  # refine a stage with conversation feedback
```

Or drive the full pipeline via CLI:

```bash
node bin/nspec.mjs init auth-feature
node bin/nspec.mjs generate auth-feature requirements --description "Add OAuth2 login..."
node bin/nspec.mjs cascade auth-feature          # design → tasks → verify
node bin/nspec.mjs verify auth-feature --scheme committee
node bin/nspec.mjs check-tasks auth-feature      # scan codebase for completion evidence
```

### Building from source

```bash
git clone https://github.com/nspec/nSpec.git
cd nSpec
npm install              # installs tsc and all devDependencies
npm run compile          # builds out/ (required before first run)
npm run package          # produces nSpec-*.vsix
```

Install the `.vsix` via **Extensions → ⋯ → Install from VSIX**.

**Developing from source:**

```bash
npm install && npm run compile
# Press F5 in Cursor to launch the Extension Development Host
```

> **Mac / Linux note:** `tsc` is a local devDependency — no global install needed. `npm run compile` uses `node_modules/.bin/tsc` automatically.

---

## Usage

| Action | How |
|--------|-----|
| Open panel | `Cmd+Shift+K` (Mac) / `Ctrl+Shift+K` (Win/Linux), or Command Palette: **nSpec: Open Panel** |
| Create a spec | Click **+ New Spec** → enter name + description |
| Navigate stages | Breadcrumb: **1 Requirements › 2 Design › 3 Tasks › 4 Verify** |
| Refine a stage | Type feedback in the Refine bar → press **Refine** |
| Cascade downstream | Press **Cascade** to regenerate all stages below the current one |
| Run tasks (supervised) | Click **Run all tasks** — review each diff before it applies |
| Check task completion | Command Palette: **nSpec: Check Task Completion** |
| Custom prompts | Click the **✦ OpenSpec** badge to scaffold `_prompts/` for the active spec |
| Setup steering | Command Palette: **nSpec: Setup Steering Files** |

---

## CLI

The CLI is the primary interface for Claude Code and agent-driven workflows.

### Setup

```bash
# .env file (recommended — copy .env.example and fill in):
cp .env.example .env

# or export directly in your shell:
export NSPEC_API_KEY="sk-ant-..."
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
  --transform                                          # Import & AI-convert an existing doc
```

---

## Agent integration

### Claude Code

Three slash commands are registered in `.claude/commands/` and available in every Claude Code session:

| Command | What it does |
|---------|-------------|
| `/spec <name>` | Generate a full spec pipeline from the current conversation |
| `/spec-status [name]` | Show spec status overview or health score for a specific spec |
| `/spec-refine <name> <stage>` | Refine a spec stage using conversation feedback |

Claude Code captures the conversation, runs `vibe-to-spec`, and reports the health score. `NSPEC_API_KEY` must be set in your shell.

### Vibe-to-spec

Convert any conversation or transcript into a spec:

```bash
# From a file
node bin/nspec.mjs vibe-to-spec my-feature --transcript chat.md --cascade

# From stdin
cat conversation.md | node bin/nspec.mjs vibe-to-spec my-feature --cascade
```

---

## Configuration (Cursor settings)

All settings are under `Cmd+,` → search `nspec`.

| Setting | Default | Description |
|---------|---------|-------------|
| `nspec.apiKey` | — | Anthropic (or OpenAI) API key |
| `nspec.apiBaseUrl` | `https://api.openai.com/v1` | API base URL — set to `https://api.anthropic.com/v1` for Anthropic |
| `nspec.apiModel` | `gpt-4o` | Model name — set to `claude-sonnet-4-20250514` for Claude |
| `nspec.specsFolder` | `.specs` | Folder where specs are stored (relative to workspace root) |
| `nspec.allowedCommands` | `["npm install","npm run","npx"]` | Commands auto-approved during supervised task execution |
| `nspec.jiraBaseUrl` | — | Jira base URL (optional — parsed from browse URL automatically) |
| `nspec.jiraEmail` | — | Jira Cloud email for API authentication |
| `nspec.jiraApiToken` | — | Jira Cloud API token ([create one here](https://id.atlassian.com/manage-profile/security/api-tokens)) |

---

## Spec structure

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
| **Generation failed / no models** | Verify `nspec.apiKey` (Anthropic: `sk-ant-...`), `nspec.apiBaseUrl` (`https://api.anthropic.com/v1`), and `nspec.apiModel` (`claude-sonnet-4-20250514`) in Cursor Settings. |
| **CLI: NSPEC_API_KEY is required** | Set `NSPEC_API_KEY`, `NSPEC_API_BASE`, and `NSPEC_MODEL` in your shell or `.env` file. |
| **Panel doesn't open after cloning** | Run `npm install && npm run compile` first — `out/` must exist before the extension activates. |
| **Panel empty or stale** | Reopen the panel. Make sure a folder is open and `.specs/` exists. |
| **Tasks regeneration wiped my checkboxes** | `_progress.json` persists task state independently — checkboxes are restored automatically on next panel open. |

**Logs:** Output panel → select **nSpec** or **nSpec Hooks**.

---

## Security

- **Never commit API keys.** Use Cursor Settings (stored in your user profile) or environment variables for CLI usage. See `.env.example`.
- The `.gitignore` excludes `.env`, `.env.*`, and `*.local.json` by default.
- Supervised task execution requires explicit approval for shell commands not in `nspec.allowedCommands`.

---

## Docs

- **CLI and agent usage:** [AGENTS.md](AGENTS.md)
- **Claude Code slash commands:** [CLAUDE.md](CLAUDE.md)
- **Prompt system:** [PROMPTS.md](PROMPTS.md)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
