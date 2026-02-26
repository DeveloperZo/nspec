# Milestone 06: Quality of Life

> Preview/edit toggle, refine simplification, breadcrumb cleanup, keyboard shortcuts, and panel UX polish

## Why

M01–M05 focused on features and parity. The panel UX has accumulated friction: editing requires leaving the panel, the refine bar acts as a confusing mini-chat, the OpenSpec badge is cryptic, and there's no keyboard navigation. These aren't parity gaps — they're internal quality gaps that slow down every user session.

## Deliverables

### A. Preview / Edit toggle

Replace "Open in Editor" with an inline toggle that swaps between rendered markdown preview and a raw markdown textarea — inside the panel, no context switch.

**Behavior:**
- Toggle button in topbar: `Preview` ↔ `Edit` (icon swap)
- **Preview mode** (default): current `.md-rendered` div, read-only
- **Edit mode**: `<textarea>` with the raw markdown, syntax-highlighted if feasible (or monospace plain text for v1)
- Switching from Edit → Preview saves the content and re-renders
- Ctrl+S / Cmd+S in edit mode saves without switching views
- Textarea auto-grows to content height, scrolls within `.md-area`

**What this replaces:**
- Remove the "Open in Editor" button from topbar actions
- The existing `openFileInEditor` backend handler can stay for power users (command palette / context menu) but is no longer surfaced in the panel UI

### B. Simplify refine bar → one-shot refine button

The current bottom bar has two tabs ("Ask / Refine" and "Output") with a chat-like interface that confuses users about whether their message will update the document or produce a conversational response.

**Replace with:**
- Single **Refine** button in the topbar (next to Preview/Edit toggle) that opens a small inline input
- User types a one-line instruction (e.g. "Add rate limiting to FR-3"), presses Enter
- The current stage document is regenerated with the instruction applied
- No chat history, no inquiry mode, no bottom-bar tabs
- Result streams directly into the preview area (same as current generation)

**What this replaces:**
- Remove the entire bottom bar (`#bottombar` with Ask/Refine tab, Output tab, chat entries)
- Refinement becomes a topbar action, not a persistent panel
- Chat/Q&A about specs moves to Copilot chat via `#spec` context provider (Deliverable D)

**Refinement output panel:**
- The "Output" tab content (task runner output, system messages, errors) moves to the VS Code output channel (`nSpec` channel), not the bottom bar
- Errors show as VS Code notifications via `vscode.window.showErrorMessage()`

### C. Clean up breadcrumb — remove OpenSpec badge

The `✦ OpenSpec` / `+ prompts` badge in the breadcrumb is confusing for most users and takes up valuable space.

**Changes:**
- Remove the OpenSpec badge from the breadcrumb entirely
- Move the "scaffold custom prompts" action to the command palette: `nSpec: Scaffold Custom Prompts`
- If custom prompts are active for the current spec, show a subtle indicator (small dot or asterisk after the spec name) — not a clickable badge

### D. `#spec` context provider for Copilot chat

Register a VS Code chat participant / context provider so users can type `#spec:my-feature` in Copilot chat to attach spec files as context.

**Implementation:**
- Register a `ChatParticipantProvider` in `extension.ts`
- When invoked with a spec name, inject `requirements.md + design.md + tasks.md` as context
- If no spec name, inject the currently active spec from the panel
- Supports: "implement task 2.3 from #spec:user-auth", "explain the design in #spec:api-v2"

**What this enables:**
- Users ask questions about their specs in Copilot chat instead of the panel refine bar
- Agents (Copilot, Claude Code) can reference spec context naturally
- Replaces the conversational/inquiry use case of the current refine bar

### E. Cascade button on all stages

Currently the user must navigate to tasks or verify to trigger downstream generation. Add a cascade dropdown accessible from any stage.

**Changes:**
- Add a "Cascade ↓" dropdown button in topbar actions (visible on requirements, design, tasks stages)
- Dropdown options:
  - From current stage → verify (generates all downstream)
  - Regenerate current stage
  - Regenerate all stages (full pipeline from requirements)
- Disables during generation

### F. Keyboard shortcuts

Add keyboard navigation within the panel:

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + 1/2/3/4` | Switch to stage 1/2/3/4 |
| `Ctrl/Cmd + E` | Toggle preview/edit mode |
| `Ctrl/Cmd + Enter` | Generate next stage (or cascade from current) |
| `Ctrl/Cmd + R` | Focus refine input |
| `Escape` | Close modal / exit edit mode |
| `Ctrl/Cmd + S` | Save edits (in edit mode) |

### G. Additional polish

Small fixes that individually take <30 min each:

1. **Toast notifications** — Replace `console.log` in `showToast()` with a brief visual notification bar that auto-dismisses after 3 seconds (CSS animation, no library)
2. **Sidebar search/filter** — Add a search input at the top of the specs list that filters by name. Show "N specs" count below.
3. **Spec rename** — Double-click spec name in sidebar to inline-rename (renames the folder)
4. **Panel state persistence** — When the panel is hidden and re-shown, restore the last active spec + stage using `vscode.getState()` / `vscode.setState()` in the webview
5. **Empty state per stage** — When a stage has no content, show a clear CTA ("Generate requirements to get started" with a button) instead of a blank area

## Files to change

| File | Change |
|---|---|
| `src/SpecPanelProvider.ts` | Toggle mode, remove bottom bar, refine as topbar action, cascade dropdown, keyboard handler, toast, search, rename, state persistence, empty states |
| `src/extension.ts` | Register `#spec` context provider, register new commands |
| `src/specManager.ts` | `renameSpec()` function |
| `src/core/specStore.ts` | `renameSpec()` — rename folder |

## Implementation order

1. **Preview/Edit toggle** (A) — highest impact, most requested
2. **Remove bottom bar + simplify refine** (B) — depends on A for edit mode
3. **Clean breadcrumb** (C) — small, independent
4. **Keyboard shortcuts** (F) — independent
5. **Cascade button** (E) — independent
6. **`#spec` context provider** (D) — independent, needs Copilot API research
7. **Polish items** (G) — parallel with everything

## Success criteria

- [ ] Clicking "Edit" in topbar replaces rendered markdown with editable textarea
- [ ] Switching back to "Preview" saves and re-renders the markdown
- [ ] Bottom bar is removed — no chat interface in the panel
- [ ] Refine button in topbar opens inline input and regenerates the stage
- [ ] OpenSpec badge removed from breadcrumb
- [ ] `#spec:name` in Copilot chat injects spec files as context
- [ ] Cascade dropdown works from any stage
- [ ] Cmd+1 through Cmd+4 switch stages
- [ ] Toast notifications are visually visible (not just console.log)
- [ ] Sidebar search filters specs by name
- [ ] Panel restores last active spec when re-opened
