# Milestone 08: Supervised Execution

> Per-task run with diff review, codebase-based task completion detection

## Why

PARITY.md: Kiro's three remaining structural leads are all in the agent execution category — per-task Run button, supervised diff review, and codebase-based task completion detection. These are the last major functional gaps.

This milestone does NOT build a full autonomous agent (that's a different product category). Instead, it uses `vscode.lm` tool-calling to propose changes per task, presents diffs for review, and scans the codebase to detect already-completed tasks. The execution model is **supervised** — the developer approves every change.

The end-state assumes Codex handles autonomous execution via AGENTS.md. This milestone adds the **supervised UI layer** that Codex cannot provide — visual diff review, task-by-task approval, and progress reconciliation against the codebase.

## Architecture

```
┌──────────────────────────────────────────────────┐
│  nSpec Panel — Tasks View                    │
│                                                  │
│  - [ ] Set up OAuth provider (M) _FR-1, FR-2_   │
│        [▶ Run] [✓ Check]                         │
│                                                  │
│  User clicks [▶ Run]                             │
│    ↓                                             │
│  vscode.lm.sendRequest(messages, { tools })      │
│    ↓                                             │
│  Model proposes file changes via tool calls      │
│    ↓                                             │
│  nSpec renders diff in VS Code diff editor   │
│    ↓                                             │
│  User accepts / rejects each change              │
│    ↓                                             │
│  Accepted changes applied to workspace           │
│  Task auto-marked complete                       │
│                                                  │
│  User clicks [✓ Check]                           │
│    ↓                                             │
│  Scans workspace for evidence of completion      │
│  Auto-toggles checkbox if complete               │
└──────────────────────────────────────────────────┘
```

## Deliverables

### A. Per-task Run button

Add a "Run" button next to each task in the webview panel that uses `vscode.lm` tool-calling to propose implementation.

**Tool definitions for vscode.lm:**
```typescript
const tools = [
  {
    name: 'writeFile',
    description: 'Create or overwrite a file in the workspace',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Relative file path' },
        content: { type: 'string', description: 'Full file content' }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'editFile',
    description: 'Apply a targeted edit to an existing file',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Relative file path' },
        oldText: { type: 'string', description: 'Exact text to replace' },
        newText: { type: 'string', description: 'Replacement text' }
      },
      required: ['path', 'oldText', 'newText']
    }
  },
  {
    name: 'runCommand',
    description: 'Run a shell command in the workspace',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Shell command to execute' }
      },
      required: ['command']
    }
  }
];
```

**Task execution prompt:**
```
TASK_EXECUTION_SYSTEM:
You are implementing a specific task from a software specification.

Context:
- Spec requirements: {requirements.md content}
- Spec design: {design.md content}
- Task to implement: {task label and sub-items}
- Workspace context: {buildWorkspaceContext() output}

Implement this task using the provided tools. For each file change:
1. Use editFile for targeted changes to existing files
2. Use writeFile for new files
3. Use runCommand only for package installation or build commands

Do not modify files unrelated to this task. Follow the design document's architecture decisions.
```

**lmClient.ts changes:**
- Add `sendRequestWithTools(messages, tools, token)` method
- Parse tool call responses from the model
- Return structured `ProposedChange[]` array

**SpecPanelProvider.ts changes:**
- Add `[▶ Run]` button next to each incomplete task
- On click: send `runTask` message to extension
- Show spinner while model is generating
- When changes are proposed: open diff view

### B. Diff review UI

Present proposed changes in VS Code's native diff editor for approval.

**Flow:**
1. Model proposes changes (via tool calls)
2. For each file change:
   - Write proposed content to a temp file
   - Open `vscode.diff(original, proposed, title)`
   - Show accept/reject buttons in the diff editor title bar
3. User reviews each diff and accepts or rejects
4. Accepted changes are written to the workspace
5. Rejected changes are discarded

**Implementation:**
```typescript
async function showDiffForApproval(
  originalUri: vscode.Uri,
  proposedContent: string,
  label: string
): Promise<boolean> {
  const tempUri = vscode.Uri.file(path.join(tempDir, path.basename(originalUri.fsPath)));
  await vscode.workspace.fs.writeFile(tempUri, Buffer.from(proposedContent));

  await vscode.commands.executeCommand('vscode.diff', originalUri, tempUri, `${label} (proposed)`);

  const choice = await vscode.window.showInformationMessage(
    `Apply changes to ${path.basename(originalUri.fsPath)}?`,
    'Accept', 'Reject'
  );

  return choice === 'Accept';
}
```

**Batch mode:** After all diffs are reviewed, show a summary:
```
Proposed changes for "Set up OAuth provider":
  ✅ src/auth/oauth.ts (new file — accepted)
  ✅ src/auth/index.ts (modified — accepted)
  ❌ package.json (modified — rejected)

Apply 2 accepted changes?  [Apply] [Cancel]
```

**Command allow-list:**
- `runCommand` tool calls require explicit approval
- Show the command in a warning dialog before execution
- Configurable allow-list in VS Code settings: `nspec.allowedCommands`

### C. Task completion detection

Scan the codebase to detect which tasks are already implemented and auto-toggle checkboxes.

**CLI:** `nspec check-tasks <name>`

**Algorithm:**
1. Parse `tasks.md` for all task labels and their sub-items
2. For each task, extract implementation signals:
   - File names mentioned in sub-items (e.g., "Create `AuthService` class")
   - Function/class names mentioned
   - Package names mentioned (check `package.json`)
3. Scan the workspace for evidence:
   - File existence checks
   - Grep for class/function names
   - Package.json dependency checks
4. Score each task: 0 (no evidence) to 1.0 (strong evidence)
5. Tasks scoring > 0.7 are auto-marked complete in `_progress.json`

**AI-assisted detection (optional):**
Send the task list + a directory listing to the model:
```
TASK_CHECK_SYSTEM:
Given the following task list and the current workspace structure, determine which tasks
appear to be already implemented. For each task, respond with:
- COMPLETE: evidence found (list the files/functions that satisfy it)
- PARTIAL: some evidence found
- INCOMPLETE: no evidence found
```

**Panel UI:**
- `[✓ Check]` button next to each task (checks individual task)
- `[✓ Check All]` button in the tasks header (checks all tasks)
- Auto-checked tasks show with a "verified" indicator
- Tooltip shows the evidence: "Found: `src/auth/oauth.ts`, `AuthService` class"

**Extension command:** `nspec.checkTasks` — runs check-tasks for the active spec.

### D. Run All Tasks (supervised)

Enhance the existing "Run all tasks" button to use supervised execution.

**Flow:**
1. User clicks "Run all tasks"
2. For each incomplete task (in order):
   a. Generate proposed changes via tool-calling
   b. Show diff review for all changes
   c. User accepts/rejects
   d. Apply accepted changes
   e. Mark task complete
   f. Move to next task
3. Show final summary of all changes applied

**Sequential execution:** Tasks run one at a time because later tasks may depend on earlier ones. Each task's execution prompt includes the current workspace state (post-previous-task changes).

**Cancellation:** User can cancel mid-run. Completed tasks stay marked; the in-progress task's changes are discarded.

## Files to change

| File | Change |
|---|---|
| `src/lmClient.ts` | Add `sendRequestWithTools()`, tool call parsing, `ProposedChange` type |
| `src/core/prompts.ts` | `TASK_EXECUTION_SYSTEM`, `TASK_CHECK_SYSTEM` prompts |
| `src/core/specStore.ts` | `checkTaskCompletion()` function (file/grep scanning) |
| `src/taskRunner.ts` | Rewrite: supervised execution flow, diff generation, change application |
| `src/SpecPanelProvider.ts` | Per-task Run/Check buttons, diff review messaging, batch summary UI |
| `src/extension.ts` | Register `nspec.checkTasks` command, temp file management |
| `src/specManager.ts` | Wrappers for task execution and completion checking |
| `bin/nspec.mjs` | `check-tasks` command |
| `package.json` | New command, `nspec.allowedCommands` configuration |
| `AGENTS.md` | Document supervised execution workflow |

## Implementation order

1. **`sendRequestWithTools()` in lmClient.ts** — tool-calling infrastructure
2. **Task execution prompt** — `TASK_EXECUTION_SYSTEM` in core/prompts.ts
3. **Per-task Run in taskRunner.ts** — generate proposed changes from tool calls
4. **Diff review UI** — show diffs, accept/reject flow, batch summary
5. **Task completion detection** — `check-tasks` CLI + file scanning
6. **Panel UI updates** — Run/Check buttons, progress indicators
7. **Run All Tasks (supervised)** — sequential execution with review
8. **Command allow-list** — settings configuration for shell command approval

## Success criteria

- [ ] Clicking [▶ Run] on a task proposes file changes via `vscode.lm` tool-calling
- [ ] Proposed changes open in VS Code diff editor with Accept/Reject options
- [ ] Accepted changes are applied to the workspace; rejected changes are discarded
- [ ] Shell commands require explicit approval via dialog
- [ ] `nspec check-tasks my-feature` reports which tasks have evidence of completion
- [ ] [✓ Check] button auto-toggles tasks that are already implemented
- [ ] "Run all tasks" executes tasks sequentially with diff review between each
- [ ] Cancellation mid-run preserves completed tasks and discards in-progress changes
- [ ] `nspec.allowedCommands` setting controls which shell commands are auto-approved
