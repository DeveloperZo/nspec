# nSpec v2 — Current Status

> **Version:** 0.2.0 · **Milestones completed:** 3 of 5 · **Updated:** February 2026

---

## What nSpec Does Today

nSpec is a VS Code extension that generates structured spec pipelines from a feature description. It produces four documents — requirements, design, tasks, verification — and tracks implementation progress.

### Core Pipeline

| Stage | Output | Key Features |
|---|---|---|
| **Requirements** | `requirements.md` | FR numbering, Given/When/Then acceptance criteria, user stories |
| **Design** | `design.md` | Architecture, components, data models, API contracts |
| **Tasks** | `tasks.md` | Phased implementation plan with effort sizing (S/M/L/XL), `_Requirements: FR-N` traceability |
| **Verify** | `verify.md` | Coverage matrix, health score (0–100), gap report, recommended additions |

### Generation & Refinement

- **Single-shot generation** — describe a feature, get a full spec pipeline
- **Stage-by-stage refinement** — refine any stage via natural language feedback
- **Cascade generation** — generate all stages in sequence with one command
- **Interactive checkboxes** — toggle task completion in the panel
- **Progress tracking** — `_progress.json` persists state across sessions, sidebar micro-bars

### Model Support

| Provider | Configuration |
|---|---|
| **VS Code + Copilot** | Automatic via `vscode.lm` — uses whatever model is active |
| **OpenAI API** | `nspec.apiKey` + `nspec.apiModel` |
| **Anthropic API** | `nspec.apiKey` + `nspec.apiBaseUrl` |
| **Ollama (local)** | Via OpenAI-compatible endpoint |
| **Any OpenAI-compatible** | `nspec.apiBaseUrl` for custom providers |

### Customization (OpenSpec)

- **Per-stage prompt overrides** — `.specs/<name>/_prompts/<stage>.md` replaces system prompts
- **Workspace-wide prompts** — `.specs/_prompts/<stage>.md` applies to all specs
- **Custom sections** — `.specs/<name>/_sections/<stage>.md` appends extra sections
- **Role override** — `.specs/<name>/_role.md` changes the AI persona
- **Visual indicator** — `✦ OpenSpec` badge when custom prompts are active

---

## Milestone 01: Codex Bridge ✅ (Health: 87/100)

Made nSpec observable and scriptable for coding agents.

**Delivered:**
- **Shared core** — `src/core/specStore.ts` and `src/core/prompts.ts` as pure Node modules (no VS Code dependency)
- **CLI harness** — `bin/nspec.mjs` with 7 commands: `init`, `generate`, `verify`, `cascade`, `status`, `refine`, `setup-steering`
- **AGENTS.md** — structured instructions for Claude Code, Codex, and other agents to consume specs
- **File watcher** — detects external `.specs/` edits and refreshes panel within 1 second
- **Thin extension wrapper** — `specManager.ts` delegates to shared core

**Parity impact:** Closed CLI gap (§21), partially closed Agent Execution gap (§6), added new nSpec lead (Agent bridge)

---

## Milestone 02: Prompt Upgrades ✅ (Health: 93/100)

Closed format gaps for requirements clarity and traceability.

**Delivered:**
- **Given/When/Then notation** — all acceptance criteria use `GIVEN <precondition> WHEN <action> THEN <result>` format
- **Requirement-to-task traceability** — every task includes `_Requirements: FR-N` mapping
- **Verify prompt tightening** — coverage matrix built from parsed `_Requirements:` fields, Given/When/Then compliance checks, expanded cascade drift detection

**Parity impact:** Closed Requirements Format gap (§3) and Task List traceability gap (§5) — both moved from Kiro-lead to Tied

---

## Milestone 03: Steering & Context ✅ (Health: 91/100)

Injected persistent project context into generation.

**Delivered:**
- **Steering directory scanner** — reads `.specs/steering/*.md` files, prepends to every system prompt
- **Setup steering command** — `nspec setup-steering` auto-generates `product.md`, `tech.md`, `structure.md` from workspace
- **Workspace context injection** — reads package.json, tsconfig, source files; injected into design and tasks generation
- **AGENTS.md steering awareness** — updated template explains steering workflow to agents

**Parity impact:** Closed Steering gap (§7) and Codebase Awareness gap (§4) — both moved from Kiro-lead to Tied

---

## Parity Scorecard (post M01–M03)

| Category | Count |
|---|---|
| **Kiro leads** | 11 (was 22) |
| **nSpec leads** | 12 (was 11) |
| **Tied** | 11 (was 7) |

### Remaining Kiro-lead gaps

| Gap | PARITY Section | Planned Milestone |
|---|---|---|
| Multi-turn clarification | §2 | M05 |
| Bugfix spec type | §2, §3, §5 | M04 |
| Import existing Markdown | §15 | M05 |
| Agent execution (write code) | §6 | v3.0 |
| Autopilot / Supervised modes | §6 | v3.0 |
| Hooks / file-save automation | §8 | M05 |
| MCP integration | §10 | Not planned |
| Kiro Powers (domain bundles) | §10 | Not planned |
| Cross-spec referencing | §16 | M05 |
| Auto model optimization | §9 | Not planned |
| Enterprise compliance | §19 | Not planned |

### nSpec-exclusive features (Kiro does not have)

- Verification stage with coverage matrix and health score
- Gap report with recommended task additions
- Custom stage prompts (OpenSpec)
- Vendor-agnostic model support (any provider)
- Works in Cursor and existing editors
- Full VS Code Marketplace access
- No data collection / no subscription required
- Effort sizing (S/M/L/XL) on tasks
- Agent bridge (AGENTS.md)

---

## Next Milestones

### M04: Spec Variants (next up)

Expand nSpec's usefulness with alternative workflow and spec types.

| Deliverable | Description | Effort |
|---|---|---|
| **Design-first workflow** | Start from design, optionally backfill requirements upward | Low |
| **Bugfix spec type** | Root cause → fix design → regression tasks → verify | Medium |
| **Spec templates gallery** | REST API, Game Feature, ML Experiment, CLI Tool, Library/SDK | Medium |

**Parity cells flipped:** 3 (Bugfix, Design-first) + 1 new lead (Templates)

### M05: Structural Additions (after M04)

Add independently valuable subsystems.

| Deliverable | Description | Effort |
|---|---|---|
| **Import command** | `nspec import <name> <stage> <file>` with optional AI transformation | Low |
| **Cross-spec referencing** | `--context other-spec` injects reference context during generation | Low |
| **Multi-turn clarification** | Interactive Q&A before requirements generation | Medium |
| **Hooks system** | File-save triggered automation via `.specs/hooks/*.json` | High |

**Parity cells flipped:** 3–4 (Import, Cross-spec, Clarification, optionally Hooks)

---

## Architecture

```
┌─────────────────────┐     ┌───────────────────┐
│  VS Code Extension  │     │  CLI (bin/)        │
│  SpecPanelProvider   │     │  nspec.mjs     │
│  extension.ts        │     │                   │
│  lmClient.ts         │     │  callOpenAI()     │
└────────┬────────────┘     └────────┬──────────┘
         │                           │
    ┌────▼───────────────────────────▼────┐
    │         src/core/                    │
    │  specStore.ts  — file I/O + context │
    │  prompts.ts    — prompt assembly    │
    │                                      │
    │  Pure Node · No vscode · specsRoot  │
    └──────────────────────────────────────┘
         │
    ┌────▼────────────────────────────────┐
    │  .specs/                             │
    │  ├── steering/  (product, tech, …)  │
    │  ├── <name>/                         │
    │  │   ├── requirements.md            │
    │  │   ├── design.md                  │
    │  │   ├── tasks.md                   │
    │  │   ├── verify.md                  │
    │  │   ├── _progress.json             │
    │  │   ├── _prompts/ (OpenSpec)       │
    │  │   └── _role.md                   │
    │  └── _prompts/ (workspace-wide)     │
    └──────────────────────────────────────┘
```

---

## File Inventory

| File | Purpose | Lines |
|---|---|---|
| `src/core/specStore.ts` | Pure Node file I/O, steering, workspace context | ~600 |
| `src/core/prompts.ts` | Prompt template assembly | ~500 |
| `src/SpecPanelProvider.ts` | Webview UI (panel, breadcrumbs, chat) | ~2,100 |
| `src/extension.ts` | Extension entry, file watcher, commands | ~200 |
| `src/specManager.ts` | VS Code wrapper around core | ~170 |
| `src/lmClient.ts` | Language model client (vscode.lm + direct API) | ~150 |
| `bin/nspec.mjs` | CLI harness (7 commands) | ~700 |
| `AGENTS.md` | Agent instructions for CLI consumption | ~150 |
