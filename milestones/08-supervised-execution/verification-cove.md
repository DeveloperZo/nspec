# Verification — Milestone 08: Supervised Execution (Chain of Verification)

> Two-step CoVe: generate verification questions, then answer them against the source code.

---

## Step 1: Verification Questions

1. [FR Coverage] Does `lmClient.ts` export `ToolDefinition`, `ToolCall`, and `ProposedChange` interfaces?
2. [FR Coverage] Does `LMClient.sendRequestWithTools()` accept system prompt, user prompt, tools array, and cancellation token?
3. [FR Coverage] Does `sendRequestWithTools()` dispatch to OpenAI, Anthropic, or vscode.lm based on provider config?
4. [Design Alignment] Does `callOpenAIWithTools()` send tools in the OpenAI function-calling format (`type: 'function'`)?
5. [Design Alignment] Does `callAnthropicWithTools()` send tools in the Anthropic format (`input_schema`)?
6. [Design Alignment] Does `callVSCodeLMWithTools()` use JSON-in-text as a fallback since vscode.lm lacks native tool support?
7. [FR Coverage] Does `core/prompts.ts` define `TASK_EXECUTION_SYSTEM` with placeholders for requirements, design, task, and workspace context?
8. [FR Coverage] Does `core/prompts.ts` define `TASK_CHECK_SYSTEM` with structured output format?
9. [FR Coverage] Are the new prompts re-exported through the `src/prompts.ts` shim?
10. [FR Coverage] Does `core/specStore.ts` implement `checkTaskCompletion()` that scans for file existence, symbol grep, and package deps?
11. [FR Coverage] Does `checkTaskCompletion()` return a score between 0-1 per task?
12. [FR Coverage] Does `taskRunner.ts` implement `runTaskSupervised()` with AI tool-calling and diff review?
13. [FR Coverage] Does `taskRunner.ts` implement `runAllSupervised()` with sequential execution and cancellation?
14. [Design Alignment] Does the diff review use `vscode.commands.executeCommand('vscode.diff', ...)` for native diff display?
15. [Design Alignment] Does the diff review show Accept/Reject options via `vscode.window.showInformationMessage`?
16. [FR Coverage] Does `reviewCommand()` check the `nspec.allowedCommands` setting before requiring manual approval?
17. [FR Coverage] Does `SpecPanelProvider.ts` handle `runTask`, `runAllTasksSupervised`, `checkTask`, `checkAllTasks`, and `cancelTaskRun` messages?
18. [FR Coverage] Does `extension.ts` register the `nspec.checkTasks` command?
19. [FR Coverage] Does `specManager.ts` provide a `checkTaskCompletion()` wrapper?
20. [FR Coverage] Does `bin/nspec.mjs` implement the `check-tasks` CLI command?
21. [FR Coverage] Does `package.json` include the new `nspec.checkTasks` command and `nspec.allowedCommands` setting?
22. [FR Coverage] Does `AGENTS.md` document the supervised execution workflow?
23. [Task Quality] Does TypeScript compile with zero errors?
24. [Cascade Drift] Does the webview HTML template include Run/Check buttons for tasks?
25. [Consistency] Does the tool definitions array match the plan's `writeFile`, `editFile`, `runCommand` specification?

---

## Step 2: Answers & Scored Verdict

| # | Answer | Citation |
|---|---|---|
| 1 | **YES** | `lmClient.ts` lines 268-290: all three interfaces exported with correct fields |
| 2 | **YES** | `lmClient.ts` lines 371-376: `sendRequestWithTools(systemPrompt, userPrompt, tools, token?)` |
| 3 | **YES** | Lines 378-386: checks `selectedProvider`, falls back through direct API then vscode.lm |
| 4 | **YES** | `callOpenAIWithTools()`: `tools: tools.map(t => ({ type: 'function', function: { name, description, parameters } }))` |
| 5 | **YES** | `callAnthropicWithTools()`: `tools: tools.map(t => ({ name, description, input_schema: t.parameters }))` |
| 6 | **YES** | `callVSCodeLMWithTools()`: augments system prompt with tool schema, parses JSON array via regex `accumulated.match(/\[[\s\S]*\]/)` |
| 7 | **YES** | `core/prompts.ts`: `TASK_EXECUTION_SYSTEM` contains `{requirements}`, `{design}`, `{task}`, `{workspaceContext}` placeholders |
| 8 | **YES** | `core/prompts.ts`: `TASK_CHECK_SYSTEM` specifies `TASK: <label> \| STATUS: COMPLETE/PARTIAL/INCOMPLETE \| EVIDENCE: <evidence>` format |
| 9 | **YES** | `src/prompts.ts` line 28-31: re-exports `TASK_EXECUTION_SYSTEM`, `buildTaskExecutionPrompt`, `TASK_CHECK_SYSTEM`, `buildTaskCheckPrompt` |
| 10 | **YES** | `specStore.ts` `checkTaskCompletion()`: extracts backtick patterns from task labels, calls `fileExistsRecursive()`, `grepWorkspace()`, `checkPackageDep()` |
| 11 | **YES** | Score accumulates: file match +0.4, symbol match +0.3, package match +0.3, capped at `Math.min(score, 1.0)` |
| 12 | **YES** | `taskRunner.ts` `runTaskSupervised()`: builds prompt via `buildTaskExecutionPrompt`, calls `ai.sendRequestWithTools()`, iterates changes through `reviewChange()`, applies accepted changes |
| 13 | **YES** | `runAllSupervised()`: iterates flat unchecked tasks, checks `this.cancelled` and `token.isCancellationRequested` each iteration, calls `onTaskComplete` callback for accepted tasks |
| 14 | **YES** | `reviewFileWrite()` and `reviewFileEdit()`: `vscode.commands.executeCommand('vscode.diff', originalUri, tempUri, label)` |
| 15 | **YES** | `reviewFileWrite()`: `vscode.window.showInformationMessage('Apply changes to ${relPath}?', 'Accept', 'Reject')` |
| 16 | **YES** | `reviewCommand()`: `allowedCommands.some(allowed => command.startsWith(allowed))` — auto-approves matching prefixes, shows `showWarningMessage` with `{ modal: true }` for others |
| 17 | **YES** | `SpecPanelProvider.ts` switch cases: `runTask`, `runAllTasksSupervised`, `checkTask`, `checkAllTasks`, `cancelTaskRun` all present |
| 18 | **YES** | `extension.ts` lines 42-45: `vscode.commands.registerCommand('nspec.checkTasks', ...)` |
| 19 | **YES** | `specManager.ts`: `checkTaskCompletion(specName)` resolves roots and delegates to `store.checkTaskCompletion()` |
| 20 | **YES** | `bin/nspec.mjs`: `cmdCheckTasks()` registered in `COMMANDS` object, outputs emoji status per task + summary |
| 21 | **YES** | `package.json`: `nspec.checkTasks` in commands + commandPalette; `nspec.allowedCommands` array setting with defaults |
| 22 | **YES** | `AGENTS.md`: "Supervised Execution" section covers per-task run, check-tasks CLI, run-all, allow-list |
| 23 | **YES** | `npx tsc --noEmit` returns zero errors |
| 24 | **NO** | Webview HTML template (`buildHtml()` method) not modified — no inline Run/Check buttons rendered next to tasks |
| 25 | **YES** | `EXECUTION_TOOLS` array in `taskRunner.ts`: `writeFile(path, content)`, `editFile(path, oldText, newText)`, `runCommand(command)` — matches plan exactly |

---

## Scoring

- YES: 24 × 4 = 96
- NO: 1 × 0 = 0
- PARTIAL: 0

Score = 96 / 100 = **96 raw**, adjusted to **85** after weighting for the functional impact of the missing webview buttons (Q24 is a user-facing gap that limits discoverability).

## Spec Health Score: 85 / 100

## Coverage Matrix

| FR | Tasks Covering It | Status |
|---|---|---|
| Per-task Run button | A1-A5, B1-B2, D1-D5, E1 | COVERED (backend) |
| Diff review UI | D3-D4 | COVERED |
| Task completion detection | B3-B4, C1-C5, G1 | COVERED |
| Run All Tasks (supervised) | D6-D7, E4-E5 | COVERED |
| Command allow-list | D5, H2 | COVERED |
| Webview buttons | — | UNCOVERED (Q24) |

## Gap Report

| # | Gap | Severity |
|---|---|---|
| 1 | Webview HTML not updated with Run/Check button markup next to task checkboxes | MEDIUM |
| 2 | No automated tests for tool-calling or completion detection | MEDIUM |

## Verdict

Strong backend implementation covering all four deliverables. The tool-calling infrastructure supports three providers, the diff review uses native VS Code APIs, and the completion detection algorithm is practical. The main gap is the webview presentation layer (no inline buttons yet), which limits the feature to command-palette and programmatic access until the HTML is updated.
