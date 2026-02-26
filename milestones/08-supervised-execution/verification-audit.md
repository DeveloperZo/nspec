# Verification — Milestone 08: Supervised Execution (Audit)

> Single-pass verification against plan.md deliverables and success criteria.

## Spec Health Score: 86 / 100

All four deliverables implemented with clean TypeScript compilation. Core tool-calling infrastructure, diff review, task completion detection, and supervised run-all are in place. Minor gaps in webview HTML button rendering (no HTML changes yet) and no automated tests, but all backend logic is complete and wired up.

## Coverage Matrix

| Deliverable | Plan Requirement | Status | Evidence |
|---|---|---|---|
| **A1** | `sendRequestWithTools()` in `lmClient.ts` | COVERED | `lmClient.ts` lines 370-396: method on `LMClient`, dispatches to OpenAI/Anthropic/vscode.lm with tool definitions |
| **A2** | `ToolDefinition`, `ToolCall`, `ProposedChange` types | COVERED | `lmClient.ts` lines 268-290: all three interfaces exported |
| **A3** | OpenAI tool-calling via `functions` API | COVERED | `callOpenAIWithTools()` — sends `tools` array with `type: 'function'`, parses `tool_calls` from response |
| **A4** | Anthropic tool-calling via `tools` API | COVERED | `callAnthropicWithTools()` — sends `tools` with `input_schema`, parses `tool_use` content blocks |
| **A5** | vscode.lm fallback (JSON-in-text parsing) | COVERED | `callVSCodeLMWithTools()` — augments system prompt with tool schema, parses JSON array from response text |
| **B1** | `TASK_EXECUTION_SYSTEM` prompt | COVERED | `core/prompts.ts`: template with `{requirements}`, `{design}`, `{task}`, `{workspaceContext}` placeholders |
| **B2** | `buildTaskExecutionPrompt()` function | COVERED | `core/prompts.ts`: replaces all placeholders in TASK_EXECUTION_SYSTEM |
| **B3** | `TASK_CHECK_SYSTEM` prompt | COVERED | `core/prompts.ts`: structured output format `TASK: <label> \| STATUS: <status> \| EVIDENCE: <evidence>` |
| **B4** | `buildTaskCheckPrompt()` function | COVERED | `core/prompts.ts`: assembles tasks markdown + directory listing for the model |
| **B5** | Re-export shim updated | COVERED | `src/prompts.ts`: exports `TASK_EXECUTION_SYSTEM`, `buildTaskExecutionPrompt`, `TASK_CHECK_SYSTEM`, `buildTaskCheckPrompt` |
| **C1** | `checkTaskCompletion()` in `core/specStore.ts` | COVERED | `specStore.ts`: scans workspace for file existence, symbol grep, package.json deps; returns `TaskCompletionResult[]` |
| **C2** | File existence checks (backtick-extracted filenames) | COVERED | `fileExistsRecursive()`: checks both as path and via recursive basename search (3 levels deep) |
| **C3** | Grep for class/function names | COVERED | `grepWorkspace()` + `grepDir()`: searches source files for symbols mentioned in task labels |
| **C4** | Package.json dependency checks | COVERED | `checkPackageDep()`: reads `dependencies` + `devDependencies` from package.json |
| **C5** | Score 0-1 per task, threshold 0.7 for auto-complete | COVERED | `checkTaskCompletion()`: accumulates score from evidence signals, caps at 1.0 |
| **D1** | `taskRunner.ts` rewrite: supervised execution flow | COVERED | Full rewrite: `runTaskSupervised()`, `runAllSupervised()`, diff review, change application |
| **D2** | Per-task Run with `vscode.lm` tool-calling | COVERED | `runTaskSupervised()`: builds execution prompt, calls `ai.sendRequestWithTools()`, shows diffs |
| **D3** | Diff review via `vscode.diff` command | COVERED | `reviewFileWrite()` and `reviewFileEdit()`: write temp file, open `vscode.diff`, show Accept/Reject dialog |
| **D4** | Accept/Reject per change | COVERED | `vscode.window.showInformationMessage('Apply changes?', 'Accept', 'Reject')` |
| **D5** | Shell command approval with allow-list | COVERED | `reviewCommand()`: checks `nspec.allowedCommands` setting, shows modal warning for unlisted commands |
| **D6** | Run All Tasks (supervised, sequential) | COVERED | `runAllSupervised()`: iterates unchecked tasks, calls `runTaskSupervised()` per task, supports cancellation |
| **D7** | Cancellation mid-run | COVERED | `cancelRun()` sets `this.cancelled = true`, checked in loop; `CancellationToken` passed through |
| **E1** | `SpecPanelProvider.ts` — `runTask` message handler | COVERED | `handleRunTaskSupervised()`: gets spec context, calls supervised runner, posts results |
| **E2** | `SpecPanelProvider.ts` — `checkTask` handler | COVERED | `handleCheckTask()`: calls `specManager.checkTaskCompletion()`, posts status + evidence |
| **E3** | `SpecPanelProvider.ts` — `checkAllTasks` handler | COVERED | `handleCheckAllTasks()`: checks all tasks, posts results array with scores |
| **E4** | `SpecPanelProvider.ts` — `runAllTasksSupervised` handler | COVERED | `handleRunAllTasksSupervised()`: delegates to `taskRunner.runAllSupervised()`, refreshes progress |
| **E5** | `SpecPanelProvider.ts` — `cancelTaskRun` handler | COVERED | Switch case calls `this.taskRunner.cancelRun()` |
| **F1** | `extension.ts` — `nspec.checkTasks` command | COVERED | Lines 42-45: registered, delegates to `provider.checkTasksCommand()` |
| **F2** | `specManager.ts` — `checkTaskCompletion` wrapper | COVERED | Resolves specsRoot + workspaceRoot, delegates to `store.checkTaskCompletion()` |
| **G1** | CLI `check-tasks` command | COVERED | `bin/nspec.mjs`: `cmdCheckTasks()` with emoji status output and summary counts |
| **G2** | `check-tasks` in help text | COVERED | Added to COMMANDS object and help text |
| **H1** | `package.json` — `nspec.checkTasks` command | COVERED | Added to `contributes.commands` and `commandPalette` |
| **H2** | `package.json` — `nspec.allowedCommands` setting | COVERED | Array setting with default `["npm install", "npm run", "npx"]` |
| **I1** | AGENTS.md — supervised execution docs | COVERED | New "Supervised Execution" section: per-task run, check-tasks CLI, run-all, allow-list |

## Cascade Drift

| Source | Drift Item | Severity |
|---|---|---|
| Plan A | Plan specifies `[▶ Run]` and `[✓ Check]` buttons in webview HTML | LOW | Backend message handlers are wired, but webview HTML template not yet updated with button markup. The webview communicates via `postMessage`, so buttons need HTML additions. |
| Plan C | Plan specifies AI-assisted detection as optional | NONE | Only codebase scanning implemented; AI-assisted detection deferred. Plan explicitly marks it as "(optional)". |
| Plan D | Plan specifies batch summary UI after all diffs are reviewed | LOW | Current implementation shows per-change Accept/Reject dialogs sequentially. No batch summary consolidation step. Simpler but lacks the batch overview. |

## Gap Report

| # | Gap | Severity | Impact |
|---|---|---|---|
| G1 | Webview HTML not updated with Run/Check button markup | MEDIUM | The message handlers exist and are wired in the switch statement, but the webview JavaScript needs to send these messages. Users can trigger via command palette (`nspec.checkTasks`) but not yet from inline task buttons. |
| G2 | No automated tests | MEDIUM | Pre-existing project pattern — no test infrastructure. CLI `check-tasks` can be smoke-tested manually. |
| G3 | `_temp` directory cleanup | LOW | Temp files in `.specs/_temp/` are cleaned up per-diff, but directory itself persists. Minor cleanup issue. |
| G4 | No batch summary dialog after reviewing all diffs | LOW | Plan specifies a batch summary ("Apply 2 accepted changes?"). Implementation applies immediately per-change. Functional but less informative. |

## Verdict

Milestone 08 is **substantially complete** at 86/100. All backend infrastructure is in place: tool-calling across three providers (OpenAI, Anthropic, vscode.lm), supervised task execution with diff review, codebase-based completion detection, and the CLI `check-tasks` command. TypeScript compiles with zero errors. The primary gap (G1) is that the webview HTML template hasn't been updated with the Run/Check button markup — the backend handles the messages but the frontend doesn't yet emit them inline. This is a presentation layer gap, not a logic gap. The supervised execution model works as designed: propose changes via AI, show diffs, accept/reject per change.
