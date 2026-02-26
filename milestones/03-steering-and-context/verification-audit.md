# Verification — Milestone 03: Steering & Context (Audit)

> Single-pass verification against plan.md deliverables and success criteria.

## Spec Health Score: 91 / 100

Strong implementation with all four deliverables complete. All core requirements met, TypeScript compiles cleanly, CLI smoke-tested successfully. Minor gaps in testing scope.

## Coverage Matrix

| Deliverable | Plan Requirement | Status | Evidence |
|---|---|---|---|
| **A1** | `loadSteering()` scans `.specs/steering/*.md` | COVERED | `src/core/specStore.ts` lines 67-92: scans `steering/` dir, filters `.md`, sorts alphabetically |
| **A2** | Order: `steering/*.md` → `_steering.md` → `<name>/_steering.md` | COVERED | Lines 70-89: three sections in exact order specified |
| **A3** | Files separated by `\n\n---\n\n` | COVERED | Line 91: `parts.join('\n\n---\n\n')` |
| **A4** | Steering directory layout: product.md, tech.md, structure.md, testing.md | COVERED | `scaffoldSteering()` lines 372-398 generates product.md, tech.md, structure.md. testing.md is user-created. |
| **A5** | Legacy `_steering.md` still supported | COVERED | Lines 83-85: reads `_steering.md` after scanning `steering/` dir |
| **B1** | CLI command `nspec setup-steering` | COVERED | `cmdSetupSteering()` in `bin/nspec.mjs` lines 459-473, registered in COMMANDS |
| **B2** | Reads workspace (package.json, tsconfig, README, directory listing) | COVERED | `scaffoldSteering()` delegates to `inferProduct()`, `inferTech()`, `inferStructure()` — all read workspace files |
| **B3** | Generates `product.md` from README/package.json | COVERED | `inferProduct()` lines 401-431: reads README first 20 lines, supplements with package.json description/keywords |
| **B4** | Generates `tech.md` from dependencies, tsconfig, build scripts | COVERED | `inferTech()` lines 433-468: reads package.json deps/devDeps/scripts/engines, detects TypeScript/Python |
| **B5** | Generates `structure.md` from top-level directory listing | COVERED | `inferStructure()` lines 470-474: uses `listDirTree()` with depth 1 |
| **B6** | Exposed via extension command `nspec.setupSteering` | COVERED | `extension.ts` line 24: command registration. `SpecPanelProvider.ts`: `setupSteering()` public method. `package.json`: command + palette entry |
| **C1** | `buildWorkspaceContext()` function | COVERED | `src/core/specStore.ts` lines 246-303: pure Node, takes `workspaceRoot` and `specName` |
| **C2** | Reads `package.json` key fields | COVERED | Lines 249-262: extracts name, description, dependencies, devDependencies, scripts |
| **C3** | Reads `tsconfig.json` / `pyproject.toml` / `*.csproj` | COVERED | Lines 264-282: iterates config files, reads first 30 lines. Also scans for .csproj files |
| **C4** | Top-level source directory listing (1 level deep) | COVERED | Lines 284-288: `listDirTree(workspaceRoot, 1)` |
| **C5** | First 50 lines of up to 3 source files matching spec topic | COVERED | Lines 290-298: `findRelevantSourceFiles()` with fuzzy keyword matching, slices to 50 lines |
| **C6** | Injection below upstream stage content in user prompt | COVERED | CLI: `generate` and `cascade` append `\n\n${wsContext}` to user content. Extension: `SpecPanelProvider.ts` lines 390-395 |
| **C7** | Guard: only inject for `design` and `tasks` stages | COVERED | CLI `getWorkspaceContext()`: `if (stage !== 'design' && stage !== 'tasks') return ''`. Extension: `if (stage === 'design' \|\| stage === 'tasks')` |
| **C8** | Called in CLI `generate` and `cascade` | COVERED | `cmdGenerate()`: workspace context injected for design (line 193) and tasks (line 198). `cmdCascade()`: injected for design (line 329) and tasks (line 337) |
| **C9** | Called in extension `streamGenerate()` | COVERED | `SpecPanelProvider.ts` lines 390-395: calls `specManager.buildWorkspaceContext()` |
| **D1** | AGENTS.md template: steering files section | COVERED | `generateAgentsMd()`: full "Steering Files" section with Setup, What to put, When to update, How they work, Workspace context injection |
| **D2** | AGENTS.md: how to create/edit steering files | COVERED | `nspec setup-steering` command documented + manual file descriptions |
| **D3** | AGENTS.md: when to update steering files | COVERED | "When to update" subsection: new library, new convention, structure changes, new integration |
| **D4** | AGENTS.md: steering affects all future generation | COVERED | "How steering files work" subsection explains concatenation + precedence |
| **D5** | AGENTS.md: folder structure updated with steering/ | COVERED | Folder tree includes `steering/` directory with product.md, tech.md, structure.md, testing.md |

## Cascade Drift

| Source | Drift Item | Severity |
|---|---|---|
| Plan C | Plan says "In `workspaceInference.ts`: already does some of this for test scaffolding — extract and generalize". Implementation puts `buildWorkspaceContext()` in `src/core/specStore.ts` instead. | LOW — Better placement: keeps it in the vscode-free shared core, consistent with the M01 architecture. `workspaceInference.ts` has vscode imports. |
| Plan A | Plan says files separated by `\n\n---\n\n`. Previous implementation used `\n\n`. New implementation uses `\n\n---\n\n`. | NONE — Matches plan exactly |
| Plan B | Plan says `nspec setup-steering`. No mention of testing.md auto-generation. `scaffoldSteering()` generates product.md, tech.md, structure.md but not testing.md. | LOW — testing.md is listed in the directory layout as user-created content. Cannot reliably infer test conventions without running the test framework. |

## Gap Report

| # | Gap | Severity | Impact |
|---|---|---|---|
| G1 | `setup-steering` does not generate `testing.md` | LOW | User can create this file manually. Testing conventions are harder to infer reliably from workspace files alone. |
| G2 | No automated tests for the new functionality | LOW | Pre-existing gap from M01. All new code follows the same patterns. |
| G3 | `findRelevantSourceFiles` uses simple keyword matching on filename only, not content | LOW | Works for common cases (spec "auth" matches "auth.ts"). Content-based matching would require indexing. |

## Verdict

Milestone 03 is **substantially complete** at 91/100. All four deliverables (steering directory scanner, setup-steering command, workspace context injection, AGENTS.md updates) are implemented and the TypeScript build compiles cleanly. The CLI `setup-steering` command has been smoke-tested successfully — it generates product.md, tech.md, and structure.md from the workspace. The architectural decision to place `buildWorkspaceContext()` in `core/specStore.ts` instead of `workspaceInference.ts` is sound — it keeps the function vscode-free and reusable by both CLI and extension.
