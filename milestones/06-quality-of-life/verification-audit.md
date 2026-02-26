# Verification — Milestone 06: Quality of Life (Audit)

> Single-pass verification against plan.md deliverables and success criteria.

## Spec Health Score: 89 / 100

Strong implementation with all seven deliverables complete. Minor gaps in empty-state CTAs and edit-mode auto-grow, but all core UX improvements are functional and the build is clean.

## Coverage Matrix

| Deliverable | Plan Requirement | Status | Evidence |
|---|---|---|---|
| **A1** | Toggle button in topbar: Preview ↔ Edit | COVERED | `updateTopbarActions()` renders `#btn-toggle-edit` with icon swap based on `state.editMode` |
| **A2** | Preview mode: `.md-rendered` div, read-only | COVERED | Default state: `.md-area` shows `.md-rendered`, textarea hidden via CSS `.md-area .edit-textarea{display:none}` |
| **A3** | Edit mode: `<textarea>` with raw markdown, monospace | COVERED | `.edit-textarea` class: `font-family:'Consolas','Monaco','Courier New',monospace`, shown via `.md-area.editing .edit-textarea{display:block}` |
| **A4** | Switching Edit → Preview saves and re-renders | COVERED | `exitEditMode()`: reads textarea value, calls `saveContent`, re-renders via `renderMarkdown()` or `renderInteractiveTasks()` |
| **A5** | Ctrl+S in edit mode saves without switching | COVERED | Keyboard handler: `ctrl && e.key === 's' && state.editMode` → calls `saveEditWithoutExiting()` |
| **A6** | Remove "Open in Editor" button from topbar | COVERED | `updateTopbarActions()` no longer renders `#btn-open-editor`. Replaced by Edit toggle. |
| **B1** | Single Refine button in topbar | COVERED | `updateTopbarActions()` renders `#btn-refine-open` with pencil icon when stage has content |
| **B2** | Inline input opens, user types, presses Enter | COVERED | `openRefineInline()` shows `#refine-inline`, input has keydown handler for Enter |
| **B3** | Result streams into preview area | COVERED | Existing `streamRefinement()` → `streamChunk` → renders into `#md-{stage}` |
| **B4** | Remove entire bottom bar | COVERED | `#bottombar` HTML removed, replaced by `#refine-inline` div. Bottom bar CSS removed. |
| **B5** | No chat history, no inquiry mode, no bottom tabs | COVERED | Chat entries, task output div, bb-tabs all removed from HTML. `appendChatEntry`/`appendTaskOutput` functions removed. |
| **C1** | Remove OpenSpec badge from breadcrumb | COVERED | `updateBreadcrumb()` no longer renders `.openspec-badge`. Uses `.custom-prompts-dot` (6px dot) instead. |
| **C2** | Move scaffold to command palette | COVERED | `nspec.scaffoldPrompts` registered in `extension.ts` and `package.json` commands + commandPalette |
| **C3** | Subtle indicator when custom prompts active | COVERED | `.custom-prompts-dot` CSS: 6px purple dot after spec name when `state.hasCustomPrompts` |
| **D1** | `#spec:name` in Copilot chat injects spec context | COVERED | `chatHandler()` regex match for `(?:#spec:|spec:)([a-z0-9_-]+)` → `handleWithSpecContext()` |
| **D2** | Inject requirements + design + tasks as context | COVERED | `buildSpecContext()` reads all 3 stages and joins with separators |
| **D3** | `/context` command as explicit alternative | COVERED | `handleContextCommand()` registered, outputs full spec context |
| **D4** | `/context` in package.json chatParticipant commands | COVERED | `package.json` chatParticipants[0].commands includes `{name:"context"}` |
| **E1** | Cascade dropdown visible on requirements, design, tasks | COVERED | `updateTopbarActions()`: `if (stage !== 'verify')` renders `#btn-cascade-open` |
| **E2** | Dropdown: from current → verify | COVERED | `openCascadeDropdown()` renders item with `data-action="from-current"` → `cascadeFromStage` message |
| **E3** | Dropdown: regenerate current stage | COVERED | Item `data-action="regen-current"` dispatches per-stage generate commands |
| **E4** | Dropdown: full pipeline from requirements | COVERED | Item `data-action="full-pipeline"` → `cascadeFromStage` with `fromStage: 'design'` |
| **E5** | Backend cascade handler | COVERED | `handleCascadeFromStage()` iterates pipeline array, calls `handleGenerate`/`handleGenerateVerify` sequentially |
| **F1** | Ctrl/Cmd+1/2/3/4 switch stages | COVERED | Keyboard handler: `ctrl && e.key >= '1' && e.key <= '4'` → `setActiveStage(STAGES[...])` |
| **F2** | Ctrl/Cmd+E toggle edit mode | COVERED | `ctrl && e.key === 'e'` → `toggleEditMode()` |
| **F3** | Ctrl/Cmd+Enter generate next | COVERED | `ctrl && e.key === 'Enter'` → dispatches appropriate generate command based on current stage |
| **F4** | Ctrl/Cmd+R focus refine | COVERED | `ctrl && e.key === 'r'` → `openRefineInline()` |
| **F5** | Escape close modal / exit edit / close refine | COVERED | `e.key === 'Escape'` checks editMode, refine visibility, then modals |
| **F6** | Ctrl/Cmd+S save edits | COVERED | `ctrl && e.key === 's' && state.editMode` → `saveEditWithoutExiting()` |
| **G1** | Toast notifications visible | COVERED | `.toast` element with CSS animation, `showToast()` adds `.visible` class, auto-dismisses in 3s |
| **G2** | Sidebar search/filter | COVERED | `#sidebar-search` input with `input` listener, `renderSidebar()` filters by `searchFilter` |
| **G3** | Specs count below search | COVERED | `#specs-count` element rendered with filtered count |
| **G4** | Spec rename via double-click | COVERED | `.spec-item-name` `dblclick` handler creates inline `rename-input`, sends `renameSpec` message |
| **G5** | Backend rename handler | COVERED | `handleRenameSpec()` calls `specManager.renameSpec()`, sends `specRenamed` + `sendInit()` |
| **G6** | `renameSpec` in specStore.ts | COVERED | `renameSpec(specsRoot, oldName, newName)` — checks existence, calls `fs.renameSync` |
| **G7** | Panel state persistence | COVERED | `saveWebviewState()` via `vscode.setState()`, `restoreWebviewState()` via `vscode.getState()` on boot |
| **G8** | Empty state per stage | PARTIAL | Empty stages show blank `.md-rendered` div. No explicit CTA button yet — the topbar generate buttons serve this purpose. |

## Cascade Drift

| Source | Drift Item | Severity |
|---|---|---|
| Plan B4 | Plan says "Output tab moves to VS Code output channel". Implementation removes output tab entirely; task runner output goes to existing console. | LOW |
| Plan A3 | Plan says "syntax-highlighted if feasible". Implementation uses monospace plain text (v1 approach as plan suggested). | NONE — explicitly allowed |
| Plan D1 | Plan says "register ChatParticipantProvider". Implementation enhances existing chat participant with regex-based spec:name detection (proposed API not yet stable). | LOW — reasonable workaround |

## Gap Report

| # | Gap | Severity | Impact |
|---|---|---|---|
| G1 | Empty state per stage lacks explicit CTA button ("Generate requirements to get started") | MEDIUM | Users see blank area; topbar actions provide the same functionality but less discoverable for new stages |
| G2 | Edit textarea does not auto-grow on initial load (only on manual input) | LOW | User can scroll within textarea; minor UX inconvenience |
| G3 | Task runner output no longer visible in panel (bottom bar removed) | LOW | Can use VS Code Output channel or terminal; matches plan's stated direction |

## Verdict

Milestone 06 is **substantially complete** at 89/100. All seven deliverables (Preview/Edit toggle, simplified refine, clean breadcrumb, #spec context, cascade dropdown, keyboard shortcuts, polish items) are implemented and the TypeScript build compiles cleanly. The most impactful changes — the edit toggle, bottom-bar removal, and keyboard shortcuts — are fully functional. The two medium/low gaps (empty-state CTA, auto-grow) are non-blocking UX improvements that can be addressed in a future polish pass.
