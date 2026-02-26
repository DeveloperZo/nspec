# Verification — Milestone 01: Codex Bridge (Audit)

> Single-pass verification against plan.md deliverables and success criteria.

## Spec Health Score: 88 / 100

Strong implementation with all four deliverables complete. Minor gaps in edge-case handling and test coverage, but all core requirements are met and the build is clean.

## Coverage Matrix

| Deliverable | Plan Requirement | Status | Evidence |
|---|---|---|---|
| **A1** | `src/core/specStore.ts` — pure Node, takes `specsRoot: string` | COVERED | `src/core/specStore.ts` — 249 lines, zero vscode imports, every function takes `specsRoot` as first param |
| **A2** | `src/core/prompts.ts` — move prompts here | COVERED | `src/core/prompts.ts` — 330 lines, identical to original, zero vscode imports |
| **A3** | `src/specManager.ts` — thin wrapper delegating to core | COVERED | `src/specManager.ts` — 167 lines, resolves root via `vscode.workspace`, delegates all ops to `store.*` |
| **A4** | Design: `specStore.ts` functions take explicit `specsRoot` | COVERED | All 22 exported functions accept `specsRoot: string` as first parameter |
| **B1** | CLI `init` — creates folder + config, prints path | COVERED | `cmdInit()` lines 135-141, tested: `node bin/nspec.mjs init "my-feature"` outputs path |
| **B2** | CLI `generate` — reads upstream, builds prompt, calls AI, writes result | COVERED | `cmdGenerate()` lines 143-210, handles all 4 stages with custom prompt + extra sections support |
| **B3** | CLI `verify` — reads 3 stages, runs scheme, writes verify.md, prints score | COVERED | `cmdVerify()` lines 212-278, supports audit/cove/committee with parallel calls for committee |
| **B4** | CLI `cascade` — generates downstream from `--from`, ends with verify | COVERED | `cmdCascade()` lines 283-354, iterates PIPELINE_ORDER from start index |
| **B5** | CLI `status` — list all or single spec detail | COVERED | `cmdStatus()` lines 356-404, shows dots (●○○○), progress, health score |
| **B6** | CLI `refine` — sends refinement, writes update or prints inquiry | COVERED | `cmdRefine()` lines 407-445, handles INQUIRY marker detection |
| **B7** | API config via `SPECPILOT_API_KEY`, `SPECPILOT_API_BASE`, `SPECPILOT_MODEL` | COVERED | Lines 30-33, same env vars as test-harness |
| **B8** | CLI reuses `core/specStore.ts` and `core/prompts.ts` | COVERED | Lines 25-26: `require('../out/core/specStore.js')`, `require('../out/core/prompts.js')` |
| **C1** | AGENTS.md content: spec system explanation | COVERED | Lines 472-477: "What is nSpec?" section |
| **C2** | AGENTS.md content: folder structure | COVERED | Lines 479-499: Full tree diagram of `.specs/` layout |
| **C3** | AGENTS.md content: CLI commands + when to use each | COVERED | Lines 501-556: All 7 commands with examples |
| **C4** | AGENTS.md content: CLI vs direct edit guidance | COVERED | Lines 567-577: Decision table |
| **C5** | AGENTS.md content: stage pipeline + inputs | COVERED | Lines 558-565: Pipeline table with input/output/purpose |
| **C6** | AGENTS.md content: OpenSpec customization | COVERED | Lines 594-603: _steering.md, _role.md, _prompts/, _sections/ |
| **C7** | AGENTS.md content: how to read verify.md + act on gaps | COVERED | Lines 579-592: Score interpretation + fix flow |
| **C8** | Placement: don't overwrite existing AGENTS.md | COVERED | `cmdSetupAgents()` lines 449-464: checks `fs.existsSync(primaryPath)`, falls back to `.specs/AGENTS.md` |
| **D1** | FileSystemWatcher on `**/.specs/**/*.md` | COVERED | `extension.ts` lines 34-37: `RelativePattern` with `specsFolder` config |
| **D2** | Also watch `_progress.json` | COVERED | Lines 38-41: JSON watcher pattern `${specsFolder}/**/*.json` |
| **D3** | Debounce 500ms | COVERED | Line 47: `setTimeout(() => ..., 500)` with clearTimeout guard |
| **D4** | Uses configured `specsFolder` setting, not hardcoded | COVERED | Line 31: `config.get<string>('specsFolder', '.specs')` |
| **D5** | Don't re-trigger if extension wrote | COVERED | `SpecPanelProvider.ts` line 61: `Date.now() - this.lastWriteTs < 1500` guard |

## Cascade Drift

| Source | Drift Item | Severity |
|---|---|---|
| Plan B7 | Plan says `SPECPILOT_API_BASE` default is `https://api.openai.com/v1`. CLI matches. | NONE |
| Plan C8 | Plan says "append a nSpec section" as alternative. Implementation writes to `.specs/AGENTS.md` instead of appending. Reasonable tradeoff — avoids corrupting existing AGENTS.md. | LOW |
| Plan D1 | Plan says "post a `refresh` message to the webview". Implementation calls `sendInit()` which re-sends the full init payload. Functionally equivalent but slightly heavier. | LOW |

## Gap Report

| # | Gap | Severity | Impact |
|---|---|---|---|
| G1 | No `setup-agents` integration with `init` — plan says "Generated into the workspace root when the user runs `nspec init` for the first time". Currently `init` does not auto-generate AGENTS.md. | MEDIUM | Agent must manually run `setup-agents` separately. |
| G2 | `openFileInEditor` in `specManager.ts` uses `require('fs')` inline (line 111) instead of the top-level `fs` import from `core/specStore`. Minor code smell, not a bug. | LOW | Works correctly, just inconsistent. |
| G3 | Test harness (`test-harness.mjs`) still imports from `./out/prompts.js` (line 26) instead of `./out/core/prompts.js`. The old path still works because `src/prompts.ts` re-exports, but this creates a fragile dependency chain. | LOW | Works today, could break if re-export shim is removed. |
| G4 | No automated tests for the CLI commands. Plan's success criteria include functional tests but no unit test files were created. | MEDIUM | Regression risk for CLI behavior. |

## Verdict

Milestone 01 is **substantially complete** at 88/100. All four deliverables (core extraction, CLI, AGENTS.md, file watcher) are implemented and the TypeScript build compiles cleanly. The CLI has been smoke-tested for `init`, `status`, and `setup-agents`. The two medium gaps (auto-AGENTS.md on init, no CLI tests) are non-blocking for the agent-driven workflow but should be addressed before shipping. The implementation faithfully follows the plan's architecture, particularly the `specsRoot`-as-parameter design decision that enables the CLI/extension to share `core/`.
