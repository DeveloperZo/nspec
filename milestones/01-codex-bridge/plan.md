# Milestone 01: Codex Bridge

> CLI harness + AGENTS.md + file watcher — the foundation for agent-driven spec development

## Why this first

nSpec's biggest gap vs Kiro is agent execution (PARITY.md Section 6). But we don't need to build an agent runtime — Codex, Claude Code, and Cursor already ARE agents. We just need nSpec to be **observable** (file watcher) and **scriptable** (CLI). The agent reads AGENTS.md to learn the system, runs CLI commands for heavy operations, and edits files directly for refinements.

## Deliverables

### A. Extract shared core (`src/core/`)

The current `specManager.ts` is tightly coupled to VS Code (`vscode.workspace.workspaceFolders`, `vscode.workspace.getConfiguration`). Extract the pure-Node file I/O into a shared module.

**Files to create:**
- `src/core/specStore.ts` — all file CRUD, progress tracking, OpenSpec loading. Pure Node, takes `specsRoot: string` as parameter instead of reading vscode config.
- `src/core/prompts.ts` — move `src/prompts.ts` here (already pure Node, no changes needed aside from path).

**Files to modify:**
- `src/specManager.ts` — thin wrapper that resolves `specsRoot` from vscode config, then delegates to `core/specStore.ts`.

**Key design decision:** `specStore.ts` functions take an explicit `specsRoot` path. The CLI resolves it from `--specs-dir` flag or defaults to `.specs/` relative to cwd. The extension resolves it from `nspec.specsFolder` setting.

### B. CLI harness (`bin/nspec.mjs`)

A Node script (no vscode deps) that Codex can invoke. Reuses `core/specStore.ts` and `core/prompts.ts`.

**Commands:**

```
nspec init <name>
  Creates .specs/<name>/ with spec.config.json
  Prints the folder path

nspec generate <name> <stage> [--description "..."]
  Reads upstream stage content (or --description for requirements)
  Builds prompt from templates + OpenSpec overrides
  Calls AI API (env: SPECPILOT_API_KEY, SPECPILOT_API_BASE, SPECPILOT_MODEL)
  Writes result to .specs/<name>/<stage>.md
  Prints health score if stage is verify

nspec verify <name> [--scheme audit|cove|committee]
  Reads all 3 stages, runs verification
  Writes verify.md
  Prints health score + uncovered count

nspec cascade <name> [--from <stage>]
  Generates all stages downstream from --from (default: design)
  Ends with verify
  Prints scorecard

nspec status [name]
  No name: lists all specs with stage completion
  With name: shows stages present, progress %, health score

nspec refine <name> <stage> --feedback "..."
  Reads current stage content
  Sends refinement prompt
  Writes updated content (or prints inquiry response)
```

**API configuration** via env vars (same as test-harness.mjs):
- `SPECPILOT_API_KEY` — required
- `SPECPILOT_API_BASE` — default `https://api.openai.com/v1`
- `SPECPILOT_MODEL` — default `gpt-4o`

**Relationship to test-harness.mjs:** The test harness is for prompt tuning (writes to `.harness-runs/`, tracks scorecards across runs). The CLI is for production use (writes to `.specs/`, integrates with the extension). They share `core/` but serve different purposes. The test harness can stay as-is or be refactored to use `core/` later.

### C. AGENTS.md

An instructions file placed in the workspace root that teaches any coding agent the spec system. This is what Codex reads as its `AGENTS.md` (or Claude Code reads as `CLAUDE.md`, etc).

**Content structure:**
1. What the spec system is (requirements-first planning)
2. Folder structure (`.specs/<name>/` layout)
3. CLI commands available and when to use each
4. When to edit files directly vs use CLI (refinements = direct edit, generation = CLI)
5. The stage pipeline and what each stage needs as input
6. OpenSpec customization files (_steering.md, _role.md, _prompts/, _sections/)
7. How to read verify.md and act on gaps

**Placement:** Generated into the workspace root when the user runs `nspec init` for the first time (or a dedicated `nspec setup-agents` command). Should NOT overwrite an existing AGENTS.md — append a nSpec section or create `.specs/AGENTS.md`.

### D. File watcher in the extension

When Codex writes to `.specs/`, the panel should auto-refresh.

**Implementation:**
- In `extension.ts`, create a `vscode.workspace.createFileSystemWatcher` on `**/.specs/**/*.md`
- On file change/create/delete, debounce 500ms, then post a `refresh` message to the webview
- The webview re-reads spec list and current spec contents
- Also watch `_progress.json` for progress updates

**Edge cases:**
- Watcher glob must use the configured `specsFolder` setting, not hardcode `.specs`
- Debounce to avoid flooding during `cascade` (which writes 3-4 files in quick succession)
- Don't re-trigger if the extension itself just wrote the file (guard via a write timestamp or flag)

## Implementation order

1. **Extract `src/core/specStore.ts`** — refactor specManager, no new features, all tests should still pass
2. **Build `bin/nspec.mjs`** — `init`, `status` first (no AI calls), then `generate`, `verify`, `cascade`, `refine`
3. **Write AGENTS.md template** — iterate on content with a real Codex/Claude Code session
4. **Add file watcher** — wire into extension.ts, test with manual file edits

## Success criteria

- [ ] `nspec init my-feature && nspec generate my-feature requirements --description "..."` creates a valid spec
- [ ] `nspec cascade my-feature` produces requirements → design → tasks → verify in sequence
- [ ] `nspec status` lists all specs with completion state
- [ ] Editing a `.specs/` file outside VS Code causes the panel to refresh within 1 second
- [ ] A Codex/Claude Code session using AGENTS.md can create, refine, and verify a spec end-to-end without human intervention beyond the initial prompt
