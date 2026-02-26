# Milestone 03: Steering & Context

> Steering files + codebase context injection — make generation aware of the project

## Why

PARITY.md Section 7: Kiro's steering files are its most powerful feature. They inject persistent project context into every AI prompt. nSpec already reads `_steering.md` and `_role.md` per-spec, but has no workspace-wide steering directory.

PARITY.md Section 4: Kiro reads the actual codebase before generating design. nSpec generates from description + requirements only.

Both gaps make nSpec's output generic where it should be project-specific.

## Deliverables

### A. Steering directory scanner

Scan `.specs/steering/` for markdown files and concatenate all contents into the steering context.

**Current behavior:**
- `specManager.loadSteering(specName)` reads `.specs/_steering.md` (workspace) + `.specs/<name>/_steering.md` (spec)

**Target behavior:**
- Also scan `.specs/steering/*.md` and prepend all files (sorted alphabetically) to the steering context
- Order: `steering/*.md` (workspace conventions) → `_steering.md` (workspace specific) → `<name>/_steering.md` (spec specific)
- Each file separated by `\n\n---\n\n`

**Steering directory layout:**
```
.specs/
  steering/
    product.md      # Product vision, target users
    tech.md         # Technology stack, patterns, libraries
    structure.md    # Directory structure, module boundaries
    testing.md      # Test conventions, coverage requirements
  _steering.md      # (legacy single-file, still supported)
```

**Files to change:**
- `src/core/specStore.ts` (or `src/specManager.ts` if Milestone 01 not done) — update `loadSteering()` to also scan `steering/` directory

### B. Setup steering command

New CLI command: `nspec setup-steering`

Reads the workspace (package.json, tsconfig, directory listing, README) and generates initial steering files:
- `product.md` — extracted from README or package.json description
- `tech.md` — inferred from dependencies, tsconfig, build scripts
- `structure.md` — top-level directory listing with annotations

This is a one-shot generation. User edits the files after.

**Also expose via extension command:** `nspec.setupSteering` — runs the same logic via the panel UI.

### C. Codebase context injection

Before generating design, read key project files and inject them as context.

**Files to read (if they exist):**
- `package.json` — dependencies, scripts, project name
- `tsconfig.json` / `pyproject.toml` / `*.csproj` — language config
- Top-level source directory listing (1 level deep, no node_modules)
- First 50 lines of up to 3 existing source files matching the spec topic (fuzzy match on spec name vs filenames)

**Where to inject:** As an additional section in the user prompt, below the upstream stage content:

```
---
## Workspace Context

### package.json (key fields)
{ "name": "...", "dependencies": { ... } }

### Directory structure
src/
  auth/
  api/
  models/
tests/

### Existing relevant files
src/auth/session.ts (first 50 lines):
...
```

**Implementation:**
- New function `buildWorkspaceContext(specsRoot: string, specName: string): string`
- In CLI: called automatically before `generate` and `cascade`
- In extension: called in `streamGenerate()` before the AI call
- In `workspaceInference.ts`: already does some of this for test scaffolding — extract and generalize

**Guard:** Codebase context is only injected for `design` and `tasks` stages (not requirements — requirements should be user-intent only, not constrained by existing code).

### D. AGENTS.md steering awareness

Update the AGENTS.md template (from Milestone 01) to explain steering files:
- How to create/edit steering files
- When to update them (new tech decisions, new conventions)
- That they affect all future spec generation

## Files to change

| File | Change |
|---|---|
| `src/specManager.ts` (or `src/core/specStore.ts`) | `loadSteering()` — add directory scanning |
| `src/workspaceInference.ts` | Extract `buildWorkspaceContext()` |
| `src/SpecPanelProvider.ts` | Inject workspace context in `streamGenerate()` for design/tasks |
| `bin/nspec.mjs` | Inject workspace context in generate/cascade |
| `AGENTS.md` template | Add steering section |

## Implementation order

1. Steering directory scanner (extend `loadSteering`)
2. Codebase context injection (`buildWorkspaceContext`)
3. Wire into extension + CLI
4. `setup-steering` command (CLI + extension)
5. Update AGENTS.md template

## Success criteria

- [ ] `.specs/steering/tech.md` content appears in every generated spec's system prompt
- [ ] `nspec setup-steering` generates initial steering files from workspace
- [ ] Design generation includes workspace context (visible in harness `_prompts/` output)
- [ ] Design output references actual project dependencies/structure instead of generic suggestions
- [ ] Steering files are additive — removing one doesn't break anything
