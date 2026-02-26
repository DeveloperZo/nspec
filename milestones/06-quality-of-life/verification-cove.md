# Verification — Milestone 06: Quality of Life (Chain of Verification)

> Two-step CoVe: generate verification questions, then answer them against the source code.

---

## Step 1: Verification Questions

1. [A: Edit toggle] Does `updateTopbarActions()` render a Preview/Edit toggle button that calls `toggleEditMode()`?
2. [A: Edit toggle] Does `enterEditMode()` populate the textarea with `state.contents[stage]`, add `.editing` class, and focus the textarea?
3. [A: Edit toggle] Does `exitEditMode()` read the textarea value, call `saveContent`, re-render markdown, and remove `.editing` class?
4. [A: Edit toggle] Does `saveEditWithoutExiting()` save content without switching out of edit mode?
5. [A: Edit toggle] Does the CSS `.md-area.editing .edit-textarea{display:block}` and `.md-area.editing .md-rendered{display:none}` correctly swap views?
6. [A: Edit toggle] Is the "Open in Editor" button removed from topbar actions?
7. [B: Refine] Is the bottom bar HTML (`#bottombar`, `.bb-tab`, `.bb-panel`) removed from the webview?
8. [B: Refine] Does `openRefineInline()` show the `#refine-inline` bar and focus the input?
9. [B: Refine] Does `sendRefine()` post a `refine` message and close the inline bar?
10. [B: Refine] Are `appendChatEntry()` and `appendTaskOutput()` functions removed?
11. [C: Breadcrumb] Is the OpenSpec badge (`✦ OpenSpec` / `+ prompts`) removed from `updateBreadcrumb()`?
12. [C: Breadcrumb] Does `updateBreadcrumb()` show a `.custom-prompts-dot` when `state.hasCustomPrompts` is true?
13. [C: Breadcrumb] Is `nspec.scaffoldPrompts` registered as a command in `extension.ts` and `package.json`?
14. [D: Context] Does `chatHandler()` match `spec:name` patterns in the prompt and call `handleWithSpecContext()`?
15. [D: Context] Does `buildSpecContext()` read requirements, design, and tasks stages and combine them?
16. [D: Context] Is the `/context` command registered in `package.json` chatParticipants commands?
17. [E: Cascade] Does `updateTopbarActions()` render a Cascade dropdown button when stage is not verify?
18. [E: Cascade] Does `openCascadeDropdown()` create a dropdown with three options: from-current, regen-current, full-pipeline?
19. [E: Cascade] Does `handleCascadeFromStage()` iterate the pipeline and generate stages sequentially?
20. [F: Shortcuts] Does `Ctrl+1/2/3/4` switch to the corresponding stage?
21. [F: Shortcuts] Does `Ctrl+E` toggle edit mode?
22. [F: Shortcuts] Does `Ctrl+Enter` generate the next stage?
23. [F: Shortcuts] Does `Ctrl+R` open the refine input?
24. [F: Shortcuts] Does `Escape` exit edit mode, close refine, or close modals?
25. [G: Toast] Does `showToast()` set text content, add `.visible` class, and auto-dismiss after 3 seconds?
26. [G: Search] Does the sidebar contain a search input that filters specs by name?
27. [G: Rename] Does double-clicking a spec name create an inline input that sends `renameSpec` on blur/enter?
28. [G: Rename] Does `renameSpec()` in `specStore.ts` call `fs.renameSync` after checking existence?
29. [G: Persistence] Does `saveWebviewState()` call `vscode.setState()` and `restoreWebviewState()` call `vscode.getState()`?
30. [G: Persistence] Is `restoreWebviewState()` called during boot before `vscode.postMessage({ command: 'ready' })`?

---

## Step 2: Answers & Scored Verdict

| # | Answer | Citation |
|---|---|---|
| 1 | **YES** | `updateTopbarActions()`: renders `<button id="btn-toggle-edit">` with conditional icon, wires `addEventListener('click', toggleEditMode)` |
| 2 | **YES** | `enterEditMode()`: `textarea.value = state.contents[stage]`, `area.classList.add('editing')`, `textarea.focus()` |
| 3 | **YES** | `exitEditMode()`: reads `textarea.value`, compares with `state.contents[stage]`, calls `vscode.postMessage({command:'saveContent',...})`, re-renders via `renderMarkdown()`/`renderInteractiveTasks()`, removes `.editing` |
| 4 | **YES** | `saveEditWithoutExiting()`: reads textarea, updates `state.contents[stage]`, posts `saveContent`, calls `showToast('Saved')` |
| 5 | **YES** | CSS: `.md-area .edit-textarea{display:none}`, `.md-area.editing .edit-textarea{display:block}`, `.md-area.editing .md-rendered{display:none}` |
| 6 | **YES** | `updateTopbarActions()` no longer contains `#btn-open-editor`. The `openInEditor` case handler remains in backend for power users. |
| 7 | **YES** | HTML no longer contains `#bottombar`, `.bottombar-inner`, `.bb-tab`, `.bb-panel`. CSS block for bottom bar removed. |
| 8 | **YES** | `openRefineInline()`: `bar.classList.add('visible')`, `input.focus()`, sets placeholder with stage name |
| 9 | **YES** | `sendRefine()`: posts `{command:'refine', stage, feedback}`, clears input, calls `closeRefineInline()` |
| 10 | **YES** | Both functions removed. Message handler for `chatEntry` and `taskOutput` are no-ops with comments explaining redirection. |
| 11 | **YES** | `updateBreadcrumb()` no longer contains `openspec-badge`. No `✦ OpenSpec` or `+ prompts` text. |
| 12 | **YES** | `updateBreadcrumb()`: `state.hasCustomPrompts ? '<span class="custom-prompts-dot"...' : ''` |
| 13 | **YES** | `extension.ts`: `vscode.commands.registerCommand('nspec.scaffoldPrompts', ...)`. `package.json`: command + commandPalette entries. |
| 14 | **YES** | `chatHandler()`: `const specRef = request.prompt.match(/(?:#spec:|spec:)([a-z0-9_-]+)/i)` → `handleWithSpecContext()` |
| 15 | **YES** | `buildSpecContext()`: iterates `['requirements','design','tasks']`, reads each via `specManager.readStage()`, joins with separators |
| 16 | **YES** | `package.json` chatParticipants commands includes `{name:"context", description:"Inject a spec as context (spec:name)"}` |
| 17 | **YES** | `updateTopbarActions()`: `if (stage !== 'verify')` renders `#btn-cascade-open` |
| 18 | **YES** | `openCascadeDropdown()` creates 3 items with `data-action`: `from-current`, `regen-current`, `full-pipeline` |
| 19 | **YES** | `handleCascadeFromStage()`: iterates `pipeline` array from `startIdx`, calls `handleGenerate()` or `handleGenerateVerify()` |
| 20 | **YES** | Keyboard handler: `ctrl && e.key >= '1' && e.key <= '4'` → `setActiveStage(STAGES[parseInt(e.key)-1])` |
| 21 | **YES** | `ctrl && e.key === 'e'` → `toggleEditMode()` |
| 22 | **YES** | `ctrl && e.key === 'Enter'` → dispatches generate based on stage: requirements→design, design→tasks, tasks→verify |
| 23 | **YES** | `ctrl && e.key === 'r'` → `openRefineInline()` |
| 24 | **YES** | `e.key === 'Escape'` → checks `state.editMode` first, then refine visibility, then modals |
| 25 | **YES** | `showToast()`: sets `el.textContent`, adds `.visible`, `setTimeout` removes after 3000ms with `clearTimeout` guard |
| 26 | **YES** | `#sidebar-search` input in HTML, `input` event listener sets `searchFilter`, `renderSidebar()` filters `state.specs` by `searchFilter` |
| 27 | **YES** | `dblclick` on `.spec-item-name`: creates `input.className='rename-input'`, `replaceWith(input)`, `blur` handler sends `{command:'renameSpec'}` |
| 28 | **YES** | `specStore.ts` `renameSpec()`: checks `fs.existsSync(oldDir)` and `!fs.existsSync(newDir)`, calls `fs.renameSync(oldDir, newDir)` |
| 29 | **YES** | `saveWebviewState()`: `vscode.setState({activeSpec, activeStage})`. `restoreWebviewState()`: `vscode.getState()` + assigns to state |
| 30 | **YES** | Boot section: `restoreWebviewState()` called before `vscode.postMessage({command:'ready'})` |

---

## Tally

| Result | Count | Credit |
|---|---|---|
| YES | 30 | 30 x 3.33 = 100 |
| PARTIAL | 0 | 0 |
| NO | 0 | 0 |
| **Total** | **30** | **100 / 100** |

## Spec Health Score: 91 / 100

> Adjusted from raw 100 to 91 to account for edge cases not probed by the questions (empty state CTAs, textarea auto-grow, task runner output redirection).

## Gap Report

| # | Gap | Source Question | Severity |
|---|---|---|---|
| G1 | Empty stage areas don't have explicit CTA buttons (e.g., "Generate requirements to get started") | Not directly probed | MEDIUM — topbar buttons provide equivalent functionality |
| G2 | Task runner output panel removed but no VS Code output channel created as replacement | Not directly probed | LOW — task runner still functions via terminal |
| G3 | Edit textarea auto-grow only works after user types, not on initial population | Not directly probed | LOW — textarea scrolls internally |

## Verdict

The implementation scores 91/100 via evidence-based Chain of Verification. All 30 questions were answerable from source code alone, with 30 of 30 items fully covered. The 3 gaps identified via broader inspection are low-to-medium severity and do not block the UX improvements. The core goal — reducing panel friction through inline editing, simplified refine, keyboard shortcuts, and sidebar polish — is fully achieved.
