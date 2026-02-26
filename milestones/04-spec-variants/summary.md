# Milestone 04: Spec Variants — Summary

## Verification Results

| Method | Health Score | Questions/Checks | Gaps Found |
|--------|-------------|-----------------|------------|
| **Audit** (single-pass) | 89 / 100 | 22 deliverable checks | 3 gaps (1 medium, 2 low) |
| **CoVe** (chain of verification) | 92 / 100 | 25 evidence-based questions | 2 gaps (1 medium, 1 low) |
| **Committee** (synthesis) | **90 / 100** | Consensus of both reports | 1 medium, 1 low |

## What Was Built

| Deliverable | Files | Changes | Status |
|---|---|---|---|
| **A. Design-first workflow** | `core/prompts.ts`, `specStore.ts`, `nspec.mjs`, `SpecPanelProvider.ts` | New prompt template, backfill command, config support, UI toggle | Complete |
| **B. Bugfix spec type** | `core/prompts.ts`, `specStore.ts`, `nspec.mjs`, `SpecPanelProvider.ts` | 4-stage pipeline, bugfix-generate/cascade CLI, UI type selector | Complete |
| **C. Templates gallery** | `specStore.ts`, `nspec.mjs`, `SpecPanelProvider.ts` | 5-template registry, scaffold function, CLI listing, UI picker | Complete |
| **Re-export updates** | `src/prompts.ts`, `src/specManager.ts` | New exports for downstream consumers | Complete |

**Total new/modified**: ~500 lines across 5 files. TypeScript compiles with zero errors.

## New CLI Commands

| Command | Purpose |
|---|---|
| `nspec init <name> --mode design-first` | Create design-first spec |
| `nspec init <name> --type bugfix` | Create bugfix spec |
| `nspec init <name> --template rest-api` | Create spec from template |
| `nspec backfill <name> requirements` | Reverse-generate requirements from design |
| `nspec bugfix-generate <name> <stage>` | Generate bugfix stage (root-cause, fix-design, regression-tasks, verify) |
| `nspec bugfix-cascade <name>` | Cascade bugfix stages downstream |
| `nspec templates` | List available spec templates |

## Templates Available

| Template ID | Name | Domain Sections |
|---|---|---|
| `rest-api` | REST API | API Routes, Error Codes, Rate Limits |
| `game-feature` | Game Feature | Game Mechanics, Player Experience, Balance |
| `ml-experiment` | ML Experiment | Data Requirements, Metrics, Baselines |
| `cli-tool` | CLI Tool | Commands, Flags, Output Format |
| `library-sdk` | Library / SDK | Public API, Compatibility, Versioning |

## Consensus Gaps (agreed by all 3 methods)

| # | Gap | Severity | Fix Effort |
|---|---|---|---|
| **G1** | Bugfix panel doesn't show bugfix-specific stage breadcrumbs (CLI has full support) | MEDIUM | ~100 lines in SpecPanelProvider.ts to add dynamic breadcrumbs |

## Minor Gaps (low severity, non-blocking)

| # | Gap | Note |
|---|---|---|
| G2 | Templates stored as in-memory registry vs file-based `src/templates/` | Architecturally simpler, functionally equivalent |

## Success Criteria Status

| Criterion | Status |
|---|---|
| `nspec init my-api --mode design-first` + generate design from description | PASS |
| Backfill requirements from design doc produces valid requirements | PASS (code-verified) |
| `nspec init login-bug --type bugfix` creates bugfix pipeline | PASS (tested) |
| Full bugfix pipeline produces root-cause → fix-design → regression-tasks → verify | PASS (code-verified) |
| `nspec init my-api --template rest-api` scaffolds with REST API prompts/sections | PASS (tested) |
| Panel shows template picker with at least 3 options | PASS (5 templates + blank) |

## Architecture

```
┌─────────────────────────┐     ┌──────────────────────────────┐
│  VS Code Extension       │     │  CLI (bin/)                  │
│  SpecPanelProvider        │     │  nspec.mjs               │
│  - spec type selector    │     │  - init --type/--mode/       │
│  - template picker       │     │    --template                │
│  - design-first toggle   │     │  - backfill                  │
│                          │     │  - bugfix-generate           │
│                          │     │  - bugfix-cascade            │
│                          │     │  - templates                 │
└────────┬────────────────┘     └────────┬─────────────────────┘
         │                               │
    ┌────▼───────────────────────────────▼────┐
    │         src/core/                        │
    │  specStore.ts                            │
    │  - createSpecFolder(mode, template)      │
    │  - readBugfixStage / writeBugfixStage    │
    │  - scaffoldTemplate()                    │
    │  - TEMPLATE_REGISTRY                     │
    │                                          │
    │  prompts.ts                              │
    │  - buildRequirementsFromDesignPrompt()   │
    │  - buildBugfixPrompt() (4 stages)        │
    │  - buildBugfixVerificationPrompt()       │
    │  - BUGFIX_TEMPLATES                      │
    └──────────────────────────────────────────┘
```

## Conclusion

**Milestone 04 is complete and ready for use.** The final committee score of 90/100 reflects a solid implementation with all deliverables functional. The one medium gap (bugfix panel breadcrumbs) is non-blocking since the full bugfix pipeline is available via CLI. The core goal — expanding nSpec beyond requirements-first feature specs to support design-first workflows, bugfix specs, and domain-specific templates — is fully achieved.
