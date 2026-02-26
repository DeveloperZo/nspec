# Verification — Milestone 01: Codex Bridge (Chain of Verification)

> Two-step CoVe: generate verification questions, then answer them against the source code.

---

## Step 1: Verification Questions

1. [FR Coverage] Does `src/core/specStore.ts` contain zero `vscode` imports and take `specsRoot: string` as the first parameter for every exported function?
2. [FR Coverage] Does `src/core/prompts.ts` exist and contain all the same exports as the original `src/prompts.ts`?
3. [FR Coverage] Does `src/specManager.ts` delegate all file I/O to `core/specStore` while resolving paths from `vscode.workspace`?
4. [FR Coverage] Does the CLI implement all 6 commands specified in the plan: `init`, `generate`, `verify`, `cascade`, `status`, `refine`?
5. [FR Coverage] Does the CLI `generate` command support all 4 stages with correct input dependencies?
6. [FR Coverage] Does the CLI `verify` command support all 3 schemes: audit, cove, committee?
7. [FR Coverage] Does the CLI `cascade` command accept `--from` and generate stages in pipeline order?
8. [FR Coverage] Does the CLI `status` command show both list-all and single-spec views?
9. [FR Coverage] Does the CLI use env vars `SPECPILOT_API_KEY`, `SPECPILOT_API_BASE`, `SPECPILOT_MODEL` for API config?
10. [Design Alignment] Does the CLI resolve `specsDir` from `--specs-dir` flag or default to `.specs/` relative to cwd?
11. [Design Alignment] Does `specManager.ts` re-export all types (`Stage`, `SpecInfo`, `TaskProgress`, etc.) so downstream consumers are unaffected?
12. [FR Coverage] Does AGENTS.md cover all 7 content areas: spec system, folder structure, CLI commands, CLI vs edit, pipeline, OpenSpec customization, verify gaps?
13. [FR Coverage] Does `setup-agents` avoid overwriting an existing `AGENTS.md`?
14. [FR Coverage] Does the file watcher use `vscode.workspace.createFileSystemWatcher` with debounce?
15. [FR Coverage] Does the file watcher use the configured `specsFolder` setting, not hardcode `.specs`?
16. [FR Coverage] Does the file watcher watch both `.md` and `.json` files (for `_progress.json`)?
17. [Cascade Drift] Does `specManager.ts:openFileInEditor` properly import `fs` instead of using inline require?
18. [Cascade Drift] Does `test-harness.mjs` still work after prompts were moved to `core/prompts.ts`?
19. [Cascade Drift] Does `SpecPanelProvider.ts` still import from `./specManager` and `./prompts` (the shim) without breakage?
20. [Task Quality] Does the implementation include a write-guard so the extension's own writes don't re-trigger the watcher?
21. [Task Quality] Does the TypeScript compilation succeed with zero errors?
22. [Task Quality] Does `node bin/nspec.mjs` (no args) print usage help without error?
23. [Task Quality] Does `node bin/nspec.mjs init "test"` create the folder and print the path?
24. [Consistency] Does the CLI API caller match the same pattern as `test-harness.mjs` (OpenAI + Anthropic dual support)?
25. [Cascade Drift] Does `init` auto-generate AGENTS.md as the plan suggests ("Generated into the workspace root when the user runs `nspec init` for the first time")?

---

## Step 2: Answers & Scored Verdict

| # | Answer | Citation |
|---|---|---|
| 1 | **YES** | `specStore.ts` lines 1-2: imports only `path` and `fs`. All 22 exported functions take `specsRoot: string` first. |
| 2 | **YES** | `core/prompts.ts` exists (330 lines). `src/prompts.ts` re-exports all symbols: `buildSystemPrompt`, `REFINE_SYSTEM`, `buildRefinementPrompt`, etc. |
| 3 | **YES** | `specManager.ts` lines 12-18: resolves root via `vscode.workspace.getConfiguration`. Lines 79-166: every function calls `store.*` with resolved root. |
| 4 | **YES** | `COMMANDS` object at line 618-626: `init`, `generate`, `verify`, `cascade`, `status`, `refine` + bonus `setup-agents`. |
| 5 | **YES** | `cmdGenerate()`: requirements needs `--description`, design reads `requirements.md`, tasks reads `design.md`, verify reads all three. Lines 166-193. |
| 6 | **YES** | `cmdVerify()`: lines 235-272 implement audit (single call), cove (questions + verdict), committee (parallel audit+questions, then verdict, then synthesis). |
| 7 | **YES** | `cmdCascade()`: line 289 `getArg('--from') || 'design'`, line 302 iterates `PIPELINE_ORDER` from `startIdx`. |
| 8 | **YES** | `cmdStatus()`: lines 359-364 list all specs; lines 374-404 show single spec with stages, progress, health score. |
| 9 | **YES** | Lines 30-32: `process.env.SPECPILOT_API_KEY`, `SPECPILOT_API_BASE`, `SPECPILOT_MODEL`. Matches plan exactly. |
| 10 | **YES** | Line 57: `getArg('--specs-dir') || SPECS_DIR` where `SPECS_DIR = process.env.SPECPILOT_SPECS_DIR || path.join(process.cwd(), '.specs')`. |
| 11 | **YES** | `specManager.ts` lines 6-8: re-exports `SpecInfo`, `TaskItem`, `TaskProgress`, `TestQuestionnaire`, `Stage`, `ALL_STAGES`, `parseTaskItems`, `toFolderName`. |
| 12 | **YES** | AGENTS.md sections: "What is nSpec?" (spec system), "Folder Structure", "CLI Commands" (7 commands), "When to Use CLI vs Direct Edit", "Stage Pipeline", "OpenSpec Customization", "Reading verify.md and Acting on Gaps". All 7 areas covered. |
| 13 | **YES** | `cmdSetupAgents()` line 457: `if (fs.existsSync(primaryPath))` — writes to `.specs/AGENTS.md` if root `AGENTS.md` exists. |
| 14 | **YES** | `extension.ts` line 52: `vscode.workspace.createFileSystemWatcher(mdPattern)`. Lines 46-49: `setTimeout(500)` with `clearTimeout` debounce. |
| 15 | **YES** | `extension.ts` line 31: `config.get<string>('specsFolder', '.specs')`. Pattern constructed dynamically. |
| 16 | **YES** | Two watchers: `mdPattern` (line 34-37) for `*.md`, `jsonPattern` (line 38-41) for `*.json`. |
| 17 | **NO** | `specManager.ts` line 111: `const fs = require('fs')` — inline require instead of importing from `core/specStore` or top-level. Not a bug, but inconsistent. |
| 18 | **PARTIAL** | `test-harness.mjs` line 26: `require('./out/prompts.js')` — this still works because `src/prompts.ts` re-exports from `core/prompts.ts`, so `out/prompts.js` re-exports from `out/core/prompts.js`. Fragile chain, but functional. |
| 19 | **YES** | `SpecPanelProvider.ts` line 4: `import * as specManager from './specManager'`, line 8: `import { buildSystemPrompt, REFINE_SYSTEM, ... } from './prompts'`. Both resolve to the shims that delegate to core. TypeScript compiles clean. |
| 20 | **YES** | `SpecPanelProvider.ts` line 35: `private lastWriteTs = 0`. Line 61: `if (Date.now() - this.lastWriteTs < 1500) return`. Lines 405, 489, 508: stamp `this.lastWriteTs = Date.now()` before every `writeStage` call. |
| 21 | **YES** | `npm run compile` produces zero errors. `npx tsc --noEmit` also clean. |
| 22 | **YES** | Tested: prints full help text and exits with code 0. |
| 23 | **YES** | Tested: creates `.specs/test/` with `spec.config.json`, prints absolute path. |
| 24 | **YES** | `callOpenAI()` + `callAnthropic()` in CLI (lines 78-113) follow same dual-provider pattern as test-harness (lines 125-162). Uses same `IS_ANTHROPIC` detection. |
| 25 | **NO** | `cmdInit()` does not call `cmdSetupAgents()` or check for first-time AGENTS.md. Plan says "Generated into the workspace root when the user runs `nspec init` for the first time". |

---

## Tally

| Result | Count | Credit |
|---|---|---|
| YES | 21 | 21 x 4 = 84 |
| PARTIAL | 1 | 1 x 2 = 2 |
| NO | 3 | 3 x 0 = 0 |
| **Total** | **25** | **86 / 100** |

## Spec Health Score: 86 / 100

## Coverage Matrix

| Plan Deliverable | CLI init | CLI generate | CLI verify | CLI cascade | CLI status | CLI refine | AGENTS.md | File Watcher | Core Extract |
|---|---|---|---|---|---|---|---|---|---|
| Implemented? | YES | YES | YES | YES | YES | YES | YES | YES | YES |

## Gap Report

| # | Gap | Source Question | Severity |
|---|---|---|---|
| G1 | `init` does not auto-generate AGENTS.md on first use | Q25 (NO) | MEDIUM — Plan specifically says "Generated when user runs `nspec init` for the first time". Easy fix: check if AGENTS.md exists in `cmdInit()` and call `cmdSetupAgents()` if not. |
| G2 | `specManager.ts:openFileInEditor` uses inline `require('fs')` | Q17 (NO) | LOW — Functional, just inconsistent. Should use the existing top-level `path` import pattern or delegate to a `core/specStore` helper. |
| G3 | `test-harness.mjs` imports from `./out/prompts.js` (re-export shim) not `./out/core/prompts.js` | Q18 (PARTIAL) | LOW — Works today via re-export chain. Should update import path for directness and to avoid breakage if shim is removed. |

## Verdict

The implementation scores 86/100 via evidence-based Chain of Verification. All 25 questions were answerable from source code alone. 21 of 25 items are fully covered, with 1 partial and 3 gaps. The 3 NO answers are all low-to-medium severity and do not block the agent-driven workflow. The most significant gap (auto-AGENTS.md on init) is a single-line fix. The core architectural goal — separating pure-Node I/O from vscode dependencies so the CLI and extension share `core/` — is fully achieved.
