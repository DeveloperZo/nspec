# Code Quality — Reference Examples

Use when applying the code-quality-critique skill and you need concrete patterns.

## Type safety

**Avoid:**
```ts
const msg = e.data as any;
msg.command; // no checks
```

**Prefer:**
```ts
interface PanelMessage { type: string; [key: string]: unknown }
const msg = e.data as PanelMessage;
if (msg.type === 'init') { /* msg has init shape */ }
```

## Null / optional chaining

**Avoid:**
```ts
const root = getSpecsRoot();
if (!root) return null;
return store.readStage(root, specName, stage);
```

**Prefer (when call site handles null):**
```ts
const root = getSpecsRoot();
return root ? store.readStage(root, specName, stage) : null;
```
Keep explicit guards when multiple steps depend on `root`.

## Centralizing repeated logic

**Before:** Same `getSpecsRoot()` implementation in `extension.ts` and `specManager.ts`.

**After:** Export `getSpecsRoot()` from one module (e.g. `specManager` or a small `workspace.ts`) and import where needed.

## Async error handling

**Pattern:**
```ts
try {
  const result = await doSomething(token);
  onDone();
} catch (err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  onError(token?.isCancellationRequested ? 'Cancelled.' : msg);
}
```
Dispose subscriptions (e.g. `cancelSub.dispose()`) in both success and error paths.

## Magic numbers

**Before:** `if (Date.now() - this.lastWriteTs < 1500) return;`

**After:**
```ts
const DEBOUNCE_WRITE_MS = 1500;
if (Date.now() - this.lastWriteTs < DEBOUNCE_WRITE_MS) return;
```

## Webview / XSS

Always escape user or spec-derived content when injecting into HTML:
```ts
function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
// Usage: el.innerHTML = `<span>${esc(userInput)}</span>`;
```

## Severity examples

- **Critical:** "`fs.existsSync` + `readFileSync` can throw; wrap in try/catch or use readFileSync in try and handle ENOENT."
- **Suggestion:** "Extract SSE line parsing into a small `parseSSELine(line): string | null` to reduce duplication between OpenAI and Anthropic stream handlers."
- **Nice to have:** "Consider naming the debounce constant `FILE_CHANGE_DEBOUNCE_MS` for clarity."
