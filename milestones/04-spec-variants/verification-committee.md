# Verification — Milestone 04: Spec Variants (Committee Synthesis)

> Synthesizes the Audit and Chain of Verification reports into a combined assessment.

---

## Final Health Score: 90 / 100

Weighted toward the evidence-based CoVe analysis (92) while incorporating the Audit's more conservative assessment (89). The score reflects a complete implementation with all three deliverables functional, tempered by one medium-severity gap (bugfix panel integration depth).

## Cascade Drift

Both reports agree on zero critical cascade drift. Identified items:

| Drift Item | Source | Severity | Assessment |
|---|---|---|---|
| Templates stored as code registry vs file-based `src/templates/` directory | Audit C3, CoVe G2 | LOW | The plan specified `src/templates/` as a directory. The implementation uses an in-memory `TEMPLATE_REGISTRY` array in `specStore.ts` that scaffolds files into the spec folder on init. This is architecturally simpler and avoids file-copy complexity during the TypeScript build process. Functionally equivalent. |
| Bugfix panel shows standard pipeline instead of bugfix-specific breadcrumbs | Audit G2, CoVe G1 | MEDIUM | The plan specified breadcrumb labels changing for bugfix stages. The UI creates bugfix specs but routes through the standard requirements pipeline for generation. The full bugfix-specific pipeline (root-cause → fix-design → regression-tasks → verify) is available via CLI. |

## Consensus Issues (flagged by BOTH reports — high confidence)

### 1. Bugfix pipeline depth in panel (MEDIUM)

- **Audit G2**: "Bugfix pipeline in the panel falls back to standard pipeline rather than showing bugfix-specific stages"
- **CoVe G1**: "Bugfix pipeline in panel defaults to standard requirements flow rather than bugfix-specific stage breadcrumbs"
- **Plan reference**: "The breadcrumb labels change to match the bugfix stages" + "Spec creation modal gets a 'Spec type' selector"
- **Assessment**: The spec type selector is implemented (modal radio buttons). However, the panel's stage breadcrumbs still show requirements/design/tasks/verify rather than root-cause/fix-design/regression-tasks/verify for bugfix specs. The full bugfix workflow is available via CLI (`bugfix-generate`, `bugfix-cascade`). **Recommendation**: In a future milestone, add bugfix stage breadcrumbs to the panel. This is a UI enhancement, not a functional gap.

### 2. Template storage approach (LOW)

- **Audit G1/C3**: "Templates stored in code registry rather than separate files"
- **CoVe G2**: "Templates stored in code registry rather than file-based `src/templates/` directory"
- **Assessment**: Both reports agree this is LOW severity. The plan specified `src/templates/` with per-template folders containing `_prompts/`, `_steering.md`, `_sections/`, `_role.md`. The implementation stores template metadata in `TEMPLATE_REGISTRY` and generates the files dynamically via `scaffoldTemplate()`. This is simpler and achieves the same user-facing result. No action needed.

## Contested Issues (flagged by only ONE report)

### Audit-only: "--mode validation" (LOW)

The Audit noted that `--mode design-first` doesn't validate against a strict list — invalid values silently default to `requirements-first`. **Judgment**: This is safe behavior. Invalid modes don't cause errors, they just don't have special handling. Could add a warning, but not blocking.

## Success Criteria Checklist

| Criterion | Status | Evidence |
|---|---|---|
| Design-first: `nspec init my-api --mode design-first` works | PASS | `cmdInit()` reads `--mode`, sets `generationMode: 'design-first'` in config, prints pipeline info |
| Design-first: Backfill requirements from design produces valid requirements | PASS | `cmdBackfill()` reads design.md, uses `buildRequirementsFromDesignPrompt()`, writes requirements.md |
| Bugfix: `nspec init login-bug --type bugfix` creates bugfix pipeline | PASS | `cmdInit()` reads `--type bugfix`, writes config with `generationMode: 'bugfix'`, `specType: 'bugfix'` |
| Bugfix: Full pipeline produces root-cause → fix-design → regression-tasks → verify | PASS | `cmdBugfixGenerate()` and `cmdBugfixCascade()` implement the full pipeline with correct stage dependencies |
| Templates: `nspec init my-api --template rest-api` scaffolds with REST API prompts | PASS | `cmdInit()` validates template, calls `scaffoldTemplate()` which writes `_steering.md`, `_sections/`, `_role.md` |
| Templates: Panel shows template picker with at least 3 options | PASS | Modal `<select>` dropdown with 5 template options + blank option |

## Final Verdict

Milestone 04 achieves a **Final Health Score of 90/100**. All three deliverables are implemented and TypeScript compiles cleanly. The core additions are:

- **Design-first workflow**: Config support, reverse-requirements prompt, `backfill` CLI command, UI toggle
- **Bugfix spec type**: 4-stage pipeline with dedicated prompts, `bugfix-generate` + `bugfix-cascade` CLI commands, UI spec type selector
- **Templates gallery**: 5-template registry, `scaffoldTemplate()` generates OpenSpec files, `templates` CLI listing, UI dropdown picker

One consensus medium-severity gap exists: the panel doesn't show bugfix-specific stage breadcrumbs (full bugfix pipeline is CLI-driven). This is a UI enhancement that doesn't block the bugfix workflow. The template storage approach difference is an acceptable architectural simplification.

**The milestone is ready for use.** Users can create design-first specs, bugfix specs, and template-based specs via both CLI and UI. The CLI provides the most complete experience for all three workflows, while the UI provides creation support with type selection and template picking.
