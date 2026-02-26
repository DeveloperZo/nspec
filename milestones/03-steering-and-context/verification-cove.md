# Verification — Milestone 03: Steering & Context (Chain of Verification)

> Two-step CoVe: generate verification questions, then answer them against the source code.

---

## Step 1: Verification Questions

1. [FR Coverage] Does `loadSteering()` scan `.specs/steering/` for markdown files and sort them alphabetically?
2. [FR Coverage] Does `loadSteering()` maintain the correct order: `steering/*.md` → `_steering.md` → `<name>/_steering.md`?
3. [FR Coverage] Does `loadSteering()` separate files with `\n\n---\n\n`?
4. [FR Coverage] Does `loadSteering()` still support the legacy `_steering.md` file?
5. [FR Coverage] Does `scaffoldSteering()` exist and generate product.md, tech.md, and structure.md?
6. [FR Coverage] Does `inferProduct()` read from README and package.json?
7. [FR Coverage] Does `inferTech()` read dependencies, build scripts, and detect TypeScript/Python?
8. [FR Coverage] Does `inferStructure()` produce a directory tree listing?
9. [FR Coverage] Does the CLI register a `setup-steering` command?
10. [FR Coverage] Does the extension expose a `nspec.setupSteering` command?
11. [FR Coverage] Is `nspec.setupSteering` registered in package.json commands and command palette?
12. [FR Coverage] Does `buildWorkspaceContext()` exist in `core/specStore.ts` (pure Node, no vscode)?
13. [FR Coverage] Does `buildWorkspaceContext()` read package.json key fields?
14. [FR Coverage] Does `buildWorkspaceContext()` read language config files (tsconfig.json, pyproject.toml, *.csproj)?
15. [FR Coverage] Does `buildWorkspaceContext()` include a directory listing (1 level deep)?
16. [FR Coverage] Does `buildWorkspaceContext()` include first 50 lines of up to 3 relevant source files?
17. [FR Coverage] Is workspace context only injected for `design` and `tasks` stages (not requirements or verify)?
18. [FR Coverage] Is workspace context injected in CLI `generate` and `cascade` commands?
19. [FR Coverage] Is workspace context injected in extension `streamGenerate()`?
20. [FR Coverage] Does the AGENTS.md template include steering files documentation?
21. [FR Coverage] Does the AGENTS.md template explain when to update steering files?
22. [FR Coverage] Does the AGENTS.md folder structure include the `steering/` directory?
23. [Design Alignment] Does `buildWorkspaceContext()` follow the `specsRoot`-as-parameter pattern from M01?
24. [Task Quality] Does TypeScript compile with zero errors after all changes?
25. [Task Quality] Does `node bin/nspec.mjs setup-steering` run successfully and generate files?

---

## Step 2: Answers & Scored Verdict

| # | Answer | Citation |
|---|---|---|
| 1 | **YES** | `specStore.ts` lines 71-81: reads `steeringDir`, filters `.md` files, calls `.sort()` on filenames. |
| 2 | **YES** | Lines 70-89: section 1 scans `steering/`, section 2 reads `_steering.md`, section 3 reads `<name>/_steering.md`. Correct order. |
| 3 | **YES** | Line 91: `parts.join('\n\n---\n\n')`. |
| 4 | **YES** | Lines 83-85: `readFileOrNull(path.join(specsRoot, '_steering.md'))` — legacy file still loaded. |
| 5 | **YES** | `scaffoldSteering()` lines 372-398: creates `steering/` dir, generates product.md via `inferProduct()`, tech.md via `inferTech()`, structure.md via `inferStructure()`. |
| 6 | **YES** | `inferProduct()` lines 401-431: iterates README.md variants (lines 405-418), reads package.json description and keywords (lines 421-428). |
| 7 | **YES** | `inferTech()` lines 433-468: reads package.json deps/devDeps/scripts/engines, checks for tsconfig.json (TypeScript) and pyproject.toml (Python). |
| 8 | **YES** | `inferStructure()` lines 470-474: calls `listDirTree(workspaceRoot, 1)` and wraps in markdown code block. |
| 9 | **YES** | `bin/nspec.mjs`: `cmdSetupSteering()` function defined, registered in `COMMANDS` object as `'setup-steering'`. |
| 10 | **YES** | `extension.ts` line 24: `vscode.commands.registerCommand('nspec.setupSteering', ...)`. `SpecPanelProvider.ts`: public `setupSteering()` method delegates to `specManager.setupSteering()`. |
| 11 | **YES** | `package.json`: `{ "command": "nspec.setupSteering", "title": "nSpec: Setup Steering Files" }` in commands array and command palette. |
| 12 | **YES** | `specStore.ts` lines 246-303: `export function buildWorkspaceContext(workspaceRoot: string, specName: string): string`. Zero vscode imports in file. |
| 13 | **YES** | Lines 249-262: reads `package.json`, extracts name, description, dependencies, devDependencies, scripts into JSON block. |
| 14 | **YES** | Lines 264-282: iterates `['tsconfig.json', 'pyproject.toml', 'Cargo.toml']`, reads first 30 lines. Also scans for `.csproj` files. |
| 15 | **YES** | Lines 284-288: `listDirTree(workspaceRoot, 1)` produces directory tree with `CONTEXT_SKIP` exclusions (node_modules, .git, etc.). |
| 16 | **YES** | Lines 290-298: `findRelevantSourceFiles(workspaceRoot, specName, 3)` with keyword matching, reads first 50 lines of each match. |
| 17 | **YES** | CLI `getWorkspaceContext()`: `if (stage !== 'design' && stage !== 'tasks') return ''`. Extension: `if (stage === 'design' \|\| stage === 'tasks')` guard. |
| 18 | **YES** | `cmdGenerate()`: workspace context appended for design (line 193) and tasks (line 198). `cmdCascade()`: workspace context appended for design (line 329) and tasks (line 337). |
| 19 | **YES** | `SpecPanelProvider.ts` lines 390-395: `const wsContext = specManager.buildWorkspaceContext(specName)` called before streaming, appended to `finalUserContent`. |
| 20 | **YES** | `generateAgentsMd()`: includes "## Steering Files" section with Setup, What to put, When to update, How they work, Workspace context injection subsections. |
| 21 | **YES** | "### When to update steering files" subsection: new library/framework, new convention, structure changes, new integration. |
| 22 | **YES** | Folder structure tree includes `steering/` directory with product.md, tech.md, structure.md, testing.md entries. |
| 23 | **YES** | `buildWorkspaceContext(workspaceRoot: string, specName: string)` follows the pattern. `scaffoldSteering(specsRoot: string, workspaceRoot: string)` takes both roots. The CLI resolves `process.cwd()`, the extension resolves via `getWorkspaceRoot()`. |
| 24 | **YES** | `npx tsc --noEmit` produces zero errors. `npm run compile` succeeds. |
| 25 | **YES** | Smoke test: `node bin/nspec.mjs setup-steering` generates 3 files in `.specs/steering/` with correct content. |

---

## Tally

| Result | Count | Credit |
|---|---|---|
| YES | 25 | 25 x 4 = 100 |
| PARTIAL | 0 | 0 |
| NO | 0 | 0 |
| **Total** | **25** | **100 / 100** |

## Spec Health Score: 92 / 100

Score adjusted from raw 100 to 92 to account for items not directly probed: no automated tests, `testing.md` not auto-generated, filename-only matching in `findRelevantSourceFiles`.

## Coverage Matrix

| Plan Deliverable | Steering Scanner | Setup Steering CLI | Setup Steering Extension | Workspace Context | CLI Integration | Extension Integration | AGENTS.md Update |
|---|---|---|---|---|---|---|---|
| Implemented? | YES | YES | YES | YES | YES | YES | YES |

## Gap Report

| # | Gap | Source Question | Severity |
|---|---|---|---|
| G1 | `testing.md` not auto-generated by `scaffoldSteering()` | Not directly probed | LOW — Listed in AGENTS.md as user-created. Hard to reliably infer test conventions. |
| G2 | No automated tests for new functions | General observation | LOW — Pre-existing project-wide pattern. |

## Verdict

The implementation scores 92/100 via evidence-based Chain of Verification. All 25 questions answered YES from source code. The core objective — making nSpec context-aware by scanning steering files and injecting workspace context — is fully achieved. Both CLI and extension paths are covered. The architecture correctly places new functions in `core/specStore.ts` for vscode-free reusability.
