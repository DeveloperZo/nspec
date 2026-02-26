---
name: code-quality-critique
description: Critiques code for correctness, maintainability, type safety, and best practices; suggests and applies concrete improvements. Use when the user asks for a code review, to improve code quality, refactor, or find bugs and anti-patterns.
---

# Code Quality Critique and Improvement

Apply this skill when reviewing code, improving quality, or refactoring. Be concise and actionable.

## Critique Checklist

When reviewing code, check (in order of impact):

1. **Correctness & edge cases**
   - Null/undefined handling; optional chaining vs explicit checks.
   - Empty arrays, empty strings, missing workspace folders.
   - Async errors: are they caught and surfaced? Cancellation (e.g. `CancellationToken`) respected?

2. **Type safety**
   - Avoid `any`; use `unknown` and narrow if needed.
   - Typed message payloads (e.g. `msg as { command: string; ... }`) — prefer discriminated unions or type guards.
   - Sync `require()` in TS: prefer `import fs from 'fs'` (or `import * as fs`) for consistency and tree-shaking.

3. **Duplication & structure**
   - Repeated `getSpecsRoot()` / `getWorkspaceRoot()` — centralize and reuse.
   - Copy-pasted logic (e.g. SSE parsing, hook status text) — extract helpers.
   - Large single-file modules (e.g. 900+ lines) — consider splitting by responsibility.

4. **Naming & readability**
   - Names reflect intent; booleans read clearly (`hasRequirements`, `isRefineStream`).
   - Magic numbers/strings (e.g. `1500`, `500`) — use named constants with a one-line comment.

5. **Error handling**
   - User-facing messages are clear and actionable.
   - Logging vs UI: avoid leaking internals; use an output channel or console for debug.

6. **Security & robustness**
   - No secrets in logs or error messages.
   - Webview: CSP and nonce; sanitize or escape user/content before rendering (e.g. `esc()` for HTML).
   - File paths: use workspace-relative or validated paths; avoid arbitrary user input in shell commands.

7. **Performance & resources**
   - Subscriptions (e.g. `context.subscriptions.push`) for watchers, event handlers, and disposables.
   - Debounce or throttle high-frequency events (e.g. file watchers).
   - Large strings (e.g. transcripts): truncate before sending to APIs; document limits.

8. **Tests & maintainability**
   - Core logic (parsing, task IDs, config loading) is unit-testable without VS Code runtime.
   - Complex conditionals — extract to well-named functions or document with a short comment.

## Feedback Format

Structure feedback so the user can act on it:

- **Critical**: Bugs, type-unsafe code, resource leaks, or security issues. Must fix.
- **Suggestion**: Clear improvement (readability, duplication, error handling). Should consider.
- **Nice to have**: Style, minor refactors, or optional hardening.

For each item:
- Quote the relevant code (file and line or snippet).
- State the issue in one sentence.
- Give a concrete fix (code or steps).

## When Suggesting Changes

- Prefer minimal, targeted edits over large rewrites unless the user asked for a refactor.
- Preserve existing behavior unless fixing a bug.
- If the project uses strict TypeScript or specific conventions (e.g. nSpec’s `.specs/` layout), respect them.
- After editing, run the linter or build if available and fix any new issues.

## Project-Specific Notes (nSpec)

- **Root resolution**: `getSpecsRoot()` / `getWorkspaceRoot()` appear in both `extension.ts` and `specManager.ts`; consider a single shared helper.
- **Sync `require('fs')`**: Replacing with `import * as fs from 'fs'` in `specManager.ts` and `SpecPanelProvider.ts` keeps the codebase consistent with `core/specStore.ts`.
- **Provider non-null**: `provider!` in command handlers is safe after `show()` but could be replaced with a guard or optional chaining for clarity.
- **Webview**: Inline HTML in `buildHtml()` is long; escaping via `esc()` is used for dynamic content — keep that pattern for any new user-controlled or spec-derived output.

## Additional resources

- For before/after examples and severity samples, see [reference.md](reference.md).
