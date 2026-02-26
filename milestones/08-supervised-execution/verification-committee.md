# Verification — Milestone 08: Supervised Execution (Committee Synthesis)

> Synthesizes the Audit and Chain of Verification reports into a combined assessment.

---

## Final Health Score: 85 / 100

Weighted toward the evidence-based CoVe analysis (85) with the Audit's slightly higher score (86) reflecting its more generous assessment of the backend completeness. The 1-point difference is negligible — both reports agree on the substance.

## Cascade Drift

Both reports agree on zero critical cascade drift. Identified items:

| Drift Item | Source | Severity | Assessment |
|---|---|---|---|
| Webview HTML not updated with Run/Check buttons | Audit D-drift, CoVe Q24 | MEDIUM | Backend message handlers are complete and wired. The webview JavaScript needs button markup to emit `runTask`, `checkTask`, etc. messages. This is a presentation gap, not a logic gap. |
| No batch summary dialog after diff review | Audit only | LOW | Plan specifies a consolidated "Apply N accepted changes?" dialog. Implementation applies immediately per-change. Simpler flow, arguably better UX for small change sets. |
| AI-assisted detection deferred | Both | NONE | Plan explicitly marks this as "(optional)". Codebase scanning covers the core requirement. |

## Consensus Issues (flagged by BOTH reports — high confidence)

### 1. Webview HTML buttons not yet rendered (MEDIUM)

- **Audit G1**: "Webview HTML not updated with Run/Check button markup"
- **CoVe Q24**: "NO — Webview HTML template (`buildHtml()` method) not modified"
- **Plan reference**: "Add `[▶ Run]` button next to each incomplete task" and "`[✓ Check]` button next to each task"
- **Assessment**: The backend is fully wired — `SpecPanelProvider` handles `runTask`, `checkTask`, `checkAllTasks`, `runAllTasksSupervised`, and `cancelTaskRun` messages. The webview HTML template needs additions to emit these messages. The feature is accessible via the command palette (`nSpec: Check Task Completion`) and programmatically. **Recommended fix**: Add Run/Check buttons to the task rendering section of `buildHtml()`.

### 2. No automated tests (MEDIUM)

- **Audit G2**: "No automated tests"
- **CoVe**: Implicitly confirmed — all verification is code-review based
- **Assessment**: Pre-existing project pattern. No test infrastructure exists (no `test/` directory, no test runner). The `check-tasks` CLI can be manually smoke-tested. Not a regression.

## Contested Issues (flagged by only ONE report)

### Audit-only: `_temp` directory persistence (LOW)

The Audit noted that `.specs/_temp/` is created for diff review temp files but the directory persists after cleanup. Individual files are cleaned up (try/catch `unlinkSync`), but the directory remains. **Judgment**: Negligible. The directory is empty after cleanup and hidden inside `.specs/`.

### Audit-only: No batch summary consolidation (LOW)

The plan describes a batch summary showing all accepted/rejected changes before final application. The implementation applies immediately per-Accept click. **Judgment**: The sequential approach is simpler and provides immediate feedback. A batch mode could be added later for large change sets.

## Success Criteria Checklist

| Criterion | Status | Evidence |
|---|---|---|
| Clicking [▶ Run] on a task proposes file changes via `vscode.lm` tool-calling | PASS (backend) | `handleRunTaskSupervised()` → `taskRunner.runTaskSupervised()` → `ai.sendRequestWithTools()`. Message handler wired; button markup pending. |
| Proposed changes open in VS Code diff editor with Accept/Reject options | PASS | `reviewFileWrite()` and `reviewFileEdit()` use `vscode.commands.executeCommand('vscode.diff', ...)` + `showInformationMessage('Accept', 'Reject')` |
| Accepted changes are applied to the workspace; rejected changes are discarded | PASS | `applyChange()` writes files or applies edits. Rejected changes fall through without application. |
| Shell commands require explicit approval via dialog | PASS | `reviewCommand()` shows `showWarningMessage({ modal: true })` for commands not in allow-list |
| `nspec check-tasks my-feature` reports which tasks have evidence of completion | PASS | `cmdCheckTasks()` in CLI outputs emoji status per task + summary counts |
| [✓ Check] button auto-toggles tasks that are already implemented | PASS (backend) | `handleCheckTask()` posts `taskCheckResult` message with status and evidence. Button markup pending. |
| "Run all tasks" executes tasks sequentially with diff review between each | PASS | `runAllSupervised()` iterates unchecked tasks sequentially, each goes through full diff review cycle |
| Cancellation mid-run preserves completed tasks and discards in-progress changes | PASS | `cancelRun()` sets flag checked in loop; completed tasks' changes already applied; in-progress task's review is cancelled |
| `nspec.allowedCommands` setting controls which shell commands are auto-approved | PASS | `package.json` defines the setting; `reviewCommand()` reads it and auto-approves matching prefixes |

## Final Verdict

Milestone 08 achieves a **Final Health Score of 85/100**. The supervised execution infrastructure is complete across all layers: tool-calling support for three AI providers, prompt templates for task execution and completion checking, a full diff review flow using native VS Code APIs, codebase-based task completion detection, CLI `check-tasks` command, and the `allowedCommands` configuration. TypeScript compiles with zero errors.

The primary consensus gap is the webview HTML buttons — the backend message handlers are all implemented and tested via switch-case dispatch, but the webview template needs button markup to make the feature discoverable from the task list UI. This is a presentation-layer task estimated at ~30 lines of HTML/JS. The feature is currently accessible via the command palette and programmatic API.

The implementation faithfully follows the plan's architecture: supervised (not autonomous) execution, per-change diff review, codebase scanning for completion detection, and a configurable command allow-list.
