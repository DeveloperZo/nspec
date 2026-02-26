# Verification — Milestone 05: Structural Additions (Audit)

> Single-pass verification against plan.md deliverables and success criteria.

## Spec Health Score: 91 / 100

Strong implementation with all four deliverables complete. All new subsystems are functional, the TypeScript build compiles cleanly, and the CLI commands are operational. Minor gaps in UI-side features (extension panel integration for clarification and cross-spec picker) are non-blocking since the CLI provides full coverage.

## Coverage Matrix

| Deliverable | Plan Requirement | Status | Evidence |
|---|---|---|---|
| **D1** | `nspec import <name> <stage> <file>` — copies file content into spec stage | COVERED | `bin/nspec.mjs:cmdImport()` — resolves file path, reads content, calls `store.importFile()` which writes to `.specs/<name>/<stage>.md` and syncs progress for tasks |
| **D2** | Import creates spec folder + config if needed | COVERED | `core/specStore.ts:importFile()` — calls `fs.mkdirSync(dir, { recursive: true })` and `writeConfig(dir)` before writing stage file |
| **D3** | Import syncs progress if stage is tasks | COVERED | `core/specStore.ts:importFile()` line: `if (stage === 'tasks') syncProgressFromMarkdown(...)` |
| **D4** | AI-assisted import with `--transform` flag | COVERED | `bin/nspec.mjs:cmdImport()` — when `--transform` flag present, reads file, builds prompt via `buildSystemPrompt(stage, ctx)`, calls LLM, writes transformed result |
| **D5** | `nspec generate <name> <stage> --context other-spec` | COVERED | `bin/nspec.mjs:cmdGenerate()` — reads `--context` arg, calls `store.loadCrossSpecContext()`, appends cross-spec content to user prompt |
| **D6** | Cross-spec context format includes requirements + design from referenced spec | COVERED | `core/specStore.ts:loadCrossSpecContext()` — reads requirements.md and design.md from referenced spec, wraps in `## Reference: <name>` block with consistency instruction |
| **D7** | Cross-spec context injected into cascade (design + tasks stages) | COVERED | `bin/nspec.mjs:cmdCascade()` — reads `--context` arg, loads cross-spec context, appends to `userContent` for both design and tasks stages |
| **D8** | `CLARIFICATION_SYSTEM` prompt — asks 3-5 focused questions | COVERED | `core/prompts.ts:CLARIFICATION_SYSTEM` — targets scope, users, constraints, edge cases, success criteria. Numbered questions, no spec content generation. |
| **D9** | `buildClarificationUserPrompt()` — formats description for question generation | COVERED | `core/prompts.ts:buildClarificationUserPrompt()` — wraps description with instruction to ask 3-5 clarifying questions |
| **D10** | `buildClarifiedRequirementsUserPrompt()` — combines description + Q&A transcript | COVERED | `core/prompts.ts:buildClarifiedRequirementsUserPrompt()` — concatenates description, separator, Q&A transcript, and generation instruction |
| **D11** | `nspec clarify <name> --description "..."` — interactive CLI flow | COVERED | `bin/nspec.mjs:cmdClarify()` — generates questions via LLM, collects answers via readline, generates requirements with combined context |
| **D12** | Clarify creates spec folder before generation | COVERED | `bin/nspec.mjs:cmdClarify()` — calls `store.createSpecFolder(specsDir, folderName)` before any generation |
| **D13** | Hook definition format: name, trigger, glob, action | COVERED | `core/specStore.ts:HookDefinition` interface — `name: string`, `trigger: 'onSave' | 'onCreate' | 'onDelete' | 'manual'`, `glob: string`, `action: string` |
| **D14** | `loadHooks()` reads `.specs/hooks/*.json` sorted alphabetically | COVERED | `core/specStore.ts:loadHooks()` — reads hooks dir, filters `.json` files, sorts, parses JSON, validates required fields |
| **D15** | Template variable resolution: `${filePath}`, `${specName}`, `${fileName}`, `${workspaceRoot}` | COVERED | `core/specStore.ts:resolveHookAction()` — regex-replaces `${key}` patterns from vars map |
| **D16** | `nspec hooks list` — shows active hooks with trigger info | COVERED | `bin/nspec.mjs:cmdHooks()` — `list` subcommand iterates hooks, prints name, trigger, glob, action |
| **D17** | `nspec hooks run <name>` — manually executes a hook | COVERED | `bin/nspec.mjs:cmdHooks()` — `run` subcommand finds hook by name (case-insensitive), resolves vars, executes via `exec()` |
| **D18** | Extension hook watchers: onSave, onCreate, onDelete triggers | COVERED | `extension.ts:setupHooksWatcher()` — registers `onDidSaveTextDocument`, `onDidCreateFiles`, `onDidDeleteFiles` event handlers |
| **D19** | Status bar indicator when hooks are active | COVERED | `extension.ts:setupHooksWatcher()` — creates `StatusBarItem` with zap icon showing hook count |
| **D20** | Output channel for hook execution logs | COVERED | `extension.ts` — creates `OutputChannel('nSpec Hooks')`, logs trigger, file, action, stdout/stderr, exit code per hook execution |
| **D21** | `core/hooks.ts` — glob matching, hook finding, execution | COVERED | `src/core/hooks.ts` — `matchGlob()` (glob-to-regex converter), `findMatchingHooks()`, `executeHookAction()`, `runMatchingHooks()` |
| **D22** | Re-scan hooks when hook files change | COVERED | `extension.ts:setupHooksWatcher()` — watches `hooks/**/*.json` pattern, updates status bar count on change/create/delete |
| **D23** | Re-export shim updates for new exports | COVERED | `src/prompts.ts` — re-exports `CLARIFICATION_SYSTEM`, `buildClarificationUserPrompt`, `buildClarifiedRequirementsUserPrompt`. `src/specManager.ts` — re-exports `HookDefinition` type, adds `importFile()`, `loadCrossSpecContext()`, `loadHooks()`, `resolveHookAction()` wrappers |
| **D24** | TypeScript compiles with zero errors | COVERED | `npx tsc --noEmit` — zero errors, zero warnings |

## Cascade Drift

| Source | Drift Item | Severity |
|---|---|---|
| Plan D | Plan mentions "Import... button in sidebar" for extension. Implementation adds import only via CLI and specManager wrapper, not a panel UI button. | LOW |
| Plan B | Plan mentions "Include context from... dropdown in the generate/refine UI" for extension panel. Implementation adds `--context` CLI flag but no panel dropdown. | LOW |
| Plan C | Plan mentions "Toggle in spec creation modal" for clarification. Implementation adds CLI clarify command but no panel toggle. | LOW |

## Gap Report

| # | Gap | Severity | Impact |
|---|---|---|---|
| G1 | No panel UI for import button — CLI-only import. Plan mentions "Import... button in sidebar. Opens file picker." | LOW | CLI provides full import functionality. Panel integration is a UI enhancement, not a functional gap. Agents use CLI. |
| G2 | No panel UI for cross-spec context picker — CLI-only `--context` flag. Plan mentions dropdown in generate/refine UI. | LOW | CLI `--context` flag provides full cross-spec functionality. Panel dropdown is a UX improvement. |
| G3 | No panel toggle for clarification — CLI-only `nspec clarify`. Plan mentions checkbox in creation modal. | LOW | CLI clarify command provides full multi-turn Q&A. Panel toggle is a UX improvement. |
| G4 | `hooks run` does not support `${specName}` variable resolution since no spec context is available in manual mode. | LOW | Template variable is set to empty string for manual runs. Reasonable default — manual hooks typically use `${filePath}` and `${workspaceRoot}`. |

## Verdict

Milestone 05 is **substantially complete** at 91/100. All four deliverables (Import, Cross-spec referencing, Multi-turn clarification, Hooks system) are implemented across the core (`specStore.ts`, `prompts.ts`), a new module (`core/hooks.ts`), the CLI (`nspec.mjs`), the extension (`extension.ts`), and the re-export shims. The TypeScript build compiles cleanly. The three LOW-severity gaps are all panel-side UI enhancements — the CLI provides full functional coverage for every feature. The hooks system includes file watchers, status bar indicator, output channel logging, and hook file re-scanning — a complete event-driven automation subsystem.
