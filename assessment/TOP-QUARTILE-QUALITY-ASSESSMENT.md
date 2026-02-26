# nSpec — Top-Quartile Extension Quality Assessment

**Purpose:** A deep-dive assessment of how to make nSpec a **top-quartile** VS Code / Cursor extension: reliable, secure, polished, performant, maintainable, and marketplace-ready.

**Audience:** Product and engineering leads, contributors, reviewers.  
**Scope:** Analysis and recommendations only; no source changes in this document.

---

## 1. Executive summary

### What “top quartile” means here

A **top-quartile** extension in this context is one that:

- **Works reliably** — No silent failures; clear errors and recovery paths; behaves correctly with no workspace, single folder, and multi-root.
- **Is secure and trustworthy** — API keys and user data handled safely; webview and shell use hardened; no unnecessary permissions.
- **Feels polished** — Fast activation and response; consistent UI and copy; accessibility and keyboard use considered.
- **Is maintainable** — Build and lint in CI; tests for critical paths; clear structure and documentation.
- **Is discoverable and supportable** — Strong marketplace listing (description, screenshots, categories); README and docs that get users from install to value quickly; clear contribution and support path.

nSpec today is **feature-rich** (panel, chat participant, vibe-to-spec, hooks, OpenSpec, multi-provider LM) and **architecturally sound** (core/store separation, streaming, cancellation). To reach top quartile, the main gaps are in **testing, tooling, security hardening, marketplace packaging, and documentation** — all addressable with a focused roadmap.

### Summary verdict

| Dimension | Current | Top-quartile target |
|-----------|---------|---------------------|
| **Reliability** | Good (debounce, cancellation, fallbacks) | Add tests, no-workspace/multi-root hardening |
| **Security** | Good (CSP, nonce, API key in settings) | Harden hooks, consider secret storage |
| **UX / Polish** | Good (keybinding, chat, streaming) | Loading/empty states, a11y, error copy |
| **Performance** | Good (activationEvents, lazy panel) | Optional activation tightening |
| **Maintainability** | Weak (no lint, no tests) | ESLint, Prettier, unit + extension tests |
| **Marketplace** | Weak (placeholder publisher, minimal listing) | Real publisher, screenshots, categories, keywords |
| **Documentation** | Adequate (README, AGENTS) | Changelog, troubleshooting, contribution guide |

---

## 2. Current state

### Strengths

- **Clear architecture** — `extension.ts` wires commands and watchers; `SpecPanelProvider` owns panel state and messaging; `specManager` bridges VS Code and `core/specStore`; `lmClient` abstracts vscode.lm and direct API. Core logic is in pure TS (specStore, hooks, prompts) and is testable without the host.
- **Streaming and cancellation** — Completions stream; `CancellationToken` is respected; AbortController used for fetch; subscription disposal in place.
- **Webview security** — CSP with nonce; scripts and styles from constrained origins; `esc()` used for dynamic content in the panel.
- **Dual LM support** — vscode.lm (Copilot) and direct OpenAI/Anthropic with clear configuration and error messages when no provider is available.
- **Chat integration** — Chat participant with `/spec`, `/status`, `/refine` and transcript-based spec generation.
- **Rich spec model** — Steering, roles, custom prompts, templates, bugfix/design-first modes, hooks, vibe-to-spec, verification stage.
- **File watchers** — Debounced refresh when `.specs` change; hook config changes update status bar.
- **Packaging** — `npm run compile` and `vsce package`; launch config for “Run Extension” and “Extension Tests”.

### Gaps

- **No automated tests** — No unit tests for specStore, hooks, task parsing, or prompt building. “Extension Tests” config points to `out/test/suite/index` but there is no `src` test suite. Regressions are caught only by manual runs.
- **No lint or format** — No ESLint, Prettier, or `npm run lint` / `npm run format`. Style and basic correctness are not enforced in CI.
- **Placeholder publisher** — `"publisher": "your-publisher-id"` prevents real marketplace publish and looks unprofessional.
- **Minimal README** — Install and settings are covered; no screenshots, no “Why nSpec”, no troubleshooting, no link to full docs (e.g. AGENTS.md / CLI).
- **No CHANGELOG** — Users and reviewers cannot see version history or migration notes.
- **Hook action substitution** — `resolveHookAction` substitutes `${filePath}`, `${fileName}`, etc. into shell commands. If user-edited hook JSON or path names contain shell metacharacters, risk of command injection. Vars are not escaped for the shell.
- **API key in settings** — Stored in workspace/user settings (plaintext). Acceptable for many environments; top quartile often offers optional SecretStorage for sensitive keys.
- **Empty deactivate** — `deactivate()` is empty. Fine if no resources to release; if any global state or timers exist, they should be cleared here.
- **Large single-file modules** — `SpecPanelProvider.ts` (e.g. 900+ lines) and `specStore.ts` (750+) are harder to navigate and test; splitting by responsibility would help.
- **No explicit accessibility** — Webview UI (focus, ARIA, keyboard) not audited; no `aria-label` or role guidance documented.

---

## 3. Pillars and recommendations

### Pillar 1: Reliability and correctness

**Criteria:** Predictable behavior; no silent failures; clear errors; safe with no workspace / multi-root; edge cases handled.

**Current:**  
Root resolution and “no workspace” are handled in many places; cancellation and async errors are generally handled; debounce avoids thundering herd on file changes.

**Recommendations:**

1. **Unit tests for core**  
   - Add a test runner (e.g. Jest or Vitest).  
   - Test: `parseTaskItems`, task ID stability, `matchGlob`, `resolveHookAction` (with safe and unsafe inputs), `loadSteering` / `loadCustomPrompt` ordering, `toFolderName`, `syncProgressFromMarkdown`.  
   - Keep tests in Node (no VS Code runtime) for speed and CI.

2. **Extension host tests**  
   - Implement at least one “Extension Tests” case (e.g. activate and run one command or open panel) so that `npm run compile` + extension test run becomes a gate.

3. **No-workspace and multi-root**  
   - Document and assert behavior when `workspaceFolders` is empty or has multiple roots (e.g. first folder for specs path).  
   - Consider a status-bar or panel message when no folder is open, instead of failing later inside a command.

4. **Centralize root resolution**  
   - Single `getSpecsRoot()` / `getWorkspaceRoot()` implementation (e.g. in `specManager` or a small `workspace.ts`), used by both `extension.ts` and `specManager`, to avoid drift and duplicate logic.

---

### Pillar 2: Security and privacy

**Criteria:** No secrets in code or logs; safe webview and shell use; minimal permissions; clear data handling.

**Current:**  
API key comes from settings (not hardcoded). Webview uses CSP and nonce; dynamic content is escaped. Hooks run in workspace `cwd` with a timeout.

**Recommendations:**

1. **Hooks: safe substitution**  
   - Treat hook action as a template. When substituting `filePath`, `fileName`, `workspaceRoot`, `specName`, escape values for the target shell (e.g. quote and escape for PowerShell on Windows, sh elsewhere) so that paths with spaces or `;`, `|`, `$()` etc. cannot break out of the intended command.  
   - Document that hook JSON is trusted (workspace-local) but that variable values are derived from workspace paths.

2. **Optional SecretStorage for API key**  
   - For users who prefer it, offer “Store API key in secure storage” and use `vscode.SecretStorage` (keychain/credential manager) instead of settings. Keep settings as fallback and document the choice.

3. **Audit logging**  
   - Ensure API key and tokens are never logged (e.g. in error messages or debug output). Already the case in sampled code; make it a checklist item for any new logging.

4. **Webview**  
   - Keep CSP strict; avoid `unsafe-inline` for script (nonce-only is good). Ensure any new user/spec content rendered in the panel goes through `esc()` or a sanitizer.

---

### Pillar 3: User experience and polish

**Criteria:** Fast, clear, consistent UI; helpful errors; loading and empty states; keyboard and accessibility considered.

**Current:**  
Panel has stages, breadcrumb, model selector, refine, task progress; streaming with cursor; toasts and error messages.

**Recommendations:**

1. **Loading and progress**  
   - For long operations (e.g. vibe-to-spec, first design generation), show a clear “Step 1 of N” or progress text so users know the extension is working.

2. **Error copy**  
   - Review all `showErrorMessage` / `showWarningMessage` and panel error messages. Ensure they are user-facing (no stack traces), actionable (e.g. “Add an API key in Settings → nSpec”), and consistent in tone.

3. **Empty / no-model state**  
   - When no model is available, the panel could show a short “No AI model configured” card with a “Open settings” button instead of only failing on first generate.

4. **Accessibility**  
   - Add `aria-label` (or equivalent) to key controls in the webview (e.g. stage pills, refine input, Run tasks). Ensure focus order and keyboard use are reasonable; document in CONTRIBUTING or a short a11y note.

5. **Consistency**  
   - Align terminology everywhere (e.g. “spec” vs “Spec”, “Requirements” vs “requirements” in UI). Use a single source for stage names if possible.

---

### Pillar 4: Performance and activation

**Criteria:** Extension does not slow down the host; activation is lazy where possible; heavy work is async and cancellable.

**Current:**  
`activationEvents: []` implies activation on startup (implicit). Panel and LM calls are created on demand; streaming and cancellation are implemented.

**Recommendations:**

1. **Activation events**  
   - Consider `"onCommand:nspec.open"` (and optionally other commands) so the extension activates only when the user invokes it. Reduces startup cost for users who do not use nSpec in a session. Measure startup impact before/after.

2. **Avoid work in activate()**  
   - Keep `activate()` to registration and lightweight setup. No synchronous file I/O or network in `activate()`; already largely the case.

3. **Panel**  
   - Panel content is created on first show; good. If the inline HTML/CSS/JS grows further, consider loading a bundled script instead of one huge string for maintainability (and possibly smaller memory footprint).

---

### Pillar 5: Maintainability and testing

**Criteria:** Lint and format in CI; tests for critical behavior; clear structure; dependency hygiene.

**Current:**  
TypeScript strict; compile succeeds; no ESLint/Prettier; no tests; core is well separated from host.

**Recommendations:**

1. **ESLint + Prettier**  
   - Add `eslint` and `prettier` with TypeScript support. Scripts: `lint`, `lint:fix`, `format`, `format:check`. Run `lint` and `format:check` in CI (or pre-commit). Start with recommended TS rules; enable strict rules over time.

2. **Unit tests**  
   - As in Pillar 1: Jest or Vitest for `core/specStore`, `core/hooks`, task parsing, and any pure helpers. Aim for high coverage on parsing and config resolution.

3. **Extension tests**  
   - At least one test that activates the extension and runs a command or opens the panel. Use `@vscode/test-electron` if not already. Run in CI on a matrix (e.g. latest stable VS Code).

4. **Split large files**  
   - Extract from `SpecPanelProvider.ts`: webview HTML/CSS generation (e.g. `webviewHtml.ts` or a template), and optionally message-handling branches. Extract from `specStore.ts`: hooks loading and `resolveHookAction` into a dedicated module if it grows. Improves readability and testability.

5. **Dependencies**  
   - Keep `@types/vscode` and `engines.vscode` aligned with the minimum VS Code version you support. Periodically review `npm audit` and update devDependencies.

---

### Pillar 6: Marketplace and discoverability

**Criteria:** Real publisher ID; clear description and categories; screenshots/demo; keywords and links.

**Current:**  
`publisher` is placeholder; categories are “Other”, “AI”; description is one line; no screenshots or video.

**Recommendations:**

1. **Publisher and identity**  
   - Create or use an existing publisher on the Marketplace (e.g. Azure DevOps org or personal). Set `publisher` in `package.json` and document in README.

2. **Description and categories**  
   - Expand `description` for the Marketplace (first paragraph is critical). Add a second category if it fits (e.g. “Snippets”, “Testing”, “Project Management”). Use `keywords` in `package.json` for search (e.g. “spec”, “requirements”, “design”, “tasks”, “AI”, “Copilot”, “Cursor”).

3. **Screenshots and media**  
   - Add 1–3 screenshots (e.g. panel with stages, New Spec modal, chat participant). Optionally a short GIF or video. Reference them in the Marketplace listing and in README.

4. **README**  
   - Add a short “Why nSpec” or “Features” section; “Quick start” (install → open panel → create spec); “Configuration” (link to settings); “Troubleshooting” (no model, no workspace, API errors); “Docs” (link to AGENTS.md, CLI, OpenSpec). Use the same screenshots.

5. **License and repo**  
   - Add a `LICENSE` file. In `package.json`, set `repository`, `bugs`, `homepage` if applicable so the Marketplace can link to the repo and issues.

---

### Pillar 7: Documentation and onboarding

**Criteria:** Users can install, configure, and get value quickly; contributors know how to build and test; changelog exists.

**Current:**  
README has install and Cursor/VS Code settings; AGENTS.md and CLAUDE.md cover spec system and CLI; PROMPTS.md exists.

**Recommendations:**

1. **CHANGELOG.md**  
   - Keep a changelog (e.g. Keep a Changelog style). List notable changes per version (features, fixes, breaking changes). Reference it from README.

2. **README structure**  
   - As in Pillar 6: Features, Quick start, Configuration, Troubleshooting, Docs and links. One sentence on “nSpec helps you generate and maintain specs (Requirements → Design → Tasks → Verify) using AI.”

3. **Contributing**  
   - Add CONTRIBUTING.md: how to clone, install, run `npm run compile`, run extension tests, run lint/format, and where to find spec-system docs (AGENTS.md). Mention code-quality skill in `.cursor/skills` if you want reviewers to use it.

4. **Troubleshooting**  
   - Document: “No models found” (Copilot sign-in vs Cursor API key); “No workspace folder” (open a folder first); “Generation failed” (check API key, network, model name); “Panel empty” (refresh, check .specs path). Link to Output channel “nSpec” / “nSpec Hooks” for logs.

---

## 4. Prioritized recommendations

Prioritized by **impact** and **effort** (High/Medium/Low). Do high-impact, low-effort first where possible.

### High impact, lower effort

| # | Action | Pillar | Notes |
|---|--------|--------|-------|
| 1 | Add ESLint + Prettier and `npm run lint` / `format` | Maintainability | Prevents style drift and many bugs; CI gate. |
| 2 | Set real `publisher` and add `repository` / `keywords` | Marketplace | Required for publish; improves discoverability. |
| 3 | Write CHANGELOG.md and link from README | Documentation | Trust and upgrade path. |
| 4 | Harden hook variable substitution (shell-escape) | Security | Reduces command-injection risk from path/spec names. |
| 5 | Centralize `getSpecsRoot` / `getWorkspaceRoot` | Reliability | Single source of truth; easier to test and fix edge cases. |

### High impact, higher effort

| # | Action | Pillar | Notes |
|---|--------|--------|-------|
| 6 | Unit tests for core (specStore, hooks, task parsing) | Reliability, Maintainability | Prevents regressions; enables refactors. |
| 7 | At least one Extension Host test (activate + command) | Reliability | Validates integration in CI. |
| 8 | README refresh: features, troubleshooting, screenshots | Documentation, Marketplace | Better first impression and self-service. |
| 9 | Optional SecretStorage for API key | Security, UX | Differentiator for security-conscious users. |

### Medium impact

| # | Action | Pillar | Notes |
|---|--------|--------|-------|
| 10 | Consider `onCommand:nspec.open` activation | Performance | Lazy load for non-users. |
| 11 | Clear “no model” state in panel + “Open settings” | UX | Fewer dead-ends. |
| 12 | User-facing error message audit | UX | Consistent, actionable copy. |
| 13 | Split SpecPanelProvider (e.g. webview HTML) | Maintainability | Easier to work on and test. |
| 14 | CONTRIBUTING.md (build, test, lint) | Documentation | Lowers barrier for contributors. |

### Lower priority / ongoing

| # | Action | Pillar | Notes |
|---|--------|--------|-------|
| 15 | Webview a11y (aria-label, focus, keyboard) | UX | Improves accessibility. |
| 16 | Progress steps for long flows (e.g. vibe-to-spec) | UX | Perceived performance. |
| 17 | Deactivate cleanup (if any globals/timers) | Reliability | Only if needed. |

---

## 5. Pre-publish checklist

Use this before publishing to the Marketplace or a significant release.

### Build and quality

- [ ] `npm run compile` passes with no errors.
- [ ] `npm run lint` (or equivalent) passes.
- [ ] Format check passes (`npm run format:check` or Prettier).
- [ ] Unit tests pass (when added).
- [ ] Extension Tests run and pass (when added).
- [ ] Manually: “Run Extension”, open panel, create a spec, generate design/tasks, refine, run a hook (if used).

### Security and privacy

- [ ] No API keys or secrets in source or logs.
- [ ] Hook action variables are shell-escaped (when implemented).
- [ ] Webview CSP and nonce in place; user/spec content escaped.

### Packaging and listing

- [ ] `publisher` is a real Marketplace publisher ID.
- [ ] `version` and (if applicable) `engines.vscode` updated.
- [ ] `description` and `keywords` in package.json are final.
- [ ] README has at least: install, quick start, configuration, troubleshooting, link to more docs.
- [ ] CHANGELOG.md updated for this version.
- [ ] Screenshots (and optional media) added and referenced.

### Documentation

- [ ] README “Configuration” matches actual settings.
- [ ] Troubleshooting section covers: no model, no workspace, API errors.
- [ ] CONTRIBUTING.md or equivalent explains build, test, and lint (if you expect contributors).

---

## 6. Conclusion

nSpec is already a strong extension in terms of features and architecture. Reaching **top quartile** is mainly about:

1. **Adding a quality floor** — Lint, format, and tests so changes are safe and refactors are possible.
2. **Hardening security** — Hook substitution and optional secret storage.
3. **Making it ship-ready** — Real publisher, README, CHANGELOG, screenshots, and a small set of extension tests.
4. **Improving UX and docs** — Error copy, empty states, troubleshooting, and contributing guide.

Tackling the “High impact, lower effort” items first will get the largest gain for the least cost; then invest in tests and README/onboarding for long-term maintainability and trust.
