# Milestone 04: Spec Variants

> Design-first workflow, bugfix spec type, spec templates gallery

## Why

PARITY.md Section 2: Kiro supports multiple spec variants — feature specs and bugfix specs, plus a design-first workflow where you start from design and generate requirements upward. nSpec only supports requirements-first feature specs.

These are mid-effort features that expand nSpec's usefulness without architectural changes.

## Deliverables

### A. Design-first workflow

Allow starting from the design stage and optionally backfilling requirements.

**Config change:** `spec.config.json` already has `generationMode: "requirements-first"`. Add `"design-first"` as a valid value.

**Pipeline for design-first:**
```
User provides design description
  ↓
design.md generated
  ↓  ← optional: backfill requirements from design
requirements.md generated (reverse direction)
  ↓
tasks.md generated (from design, as normal)
  ↓
verify.md
```

**Prompt for reverse-requirements:**
New template in `prompts.ts`: `requirements-from-design`
```
Given a Technical Design Document, produce a Requirements Document that captures
what this design is intended to solve. Extract functional requirements from the
design decisions. Each requirement should be traceable to a design component.
```

**UI change:** When creating a new spec, offer a toggle: "Requirements first" (default) or "Design first". When design-first, the first stage shows Design with a text input, and a "← Backfill Requirements" button appears.

**CLI:** `nspec generate <name> design --description "..."` already works if design is the first stage. Add `nspec backfill <name> requirements` to reverse-generate.

### B. Bugfix spec type

A specialized three-stage pipeline for bugfixes:

```
.specs/<name>/
├── spec.config.json     # {"generationMode": "bugfix"}
├── root-cause.md        # Stage 1: Root cause analysis
├── fix-design.md        # Stage 2: Fix design
├── regression-tasks.md  # Stage 3: Regression test tasks
└── verify.md            # Stage 4: Verification
```

**Bugfix pipeline:**
```
User describes the bug (symptoms, reproduction steps)
  ↓
root-cause.md — hypothesized root cause, affected components, blast radius
  ↓
fix-design.md — proposed fix, alternatives considered, risk assessment
  ↓
regression-tasks.md — test tasks to prevent recurrence
  ↓
verify.md — coverage of the fix against the root cause
```

**New prompts:** Four new templates in `prompts.ts` for the bugfix stages.

**UI:** Spec creation modal gets a "Spec type" selector: Feature (default) | Bugfix. The breadcrumb labels change to match the bugfix stages.

**CLI:** `nspec init <name> --type bugfix`

### C. Spec templates gallery

Pre-built starting points for common spec types:

| Template | Description | Customizations |
|---|---|---|
| REST API | CRUD endpoints, auth, validation | Sections: API Routes, Error Codes, Rate Limits |
| Game Feature | Player-facing feature for a game | Sections: Game Mechanics, Player Experience, Balance |
| ML Experiment | Model training / evaluation pipeline | Sections: Data Requirements, Metrics, Baselines |
| CLI Tool | Command-line application | Sections: Commands, Flags, Output Format |
| Library / SDK | Reusable package with public API | Sections: Public API, Compatibility, Versioning |

**Implementation:** Each template is a set of:
- `_prompts/<stage>.md` — custom system prompts
- `_steering.md` — domain context
- `_sections/<stage>.md` — extra sections
- `_role.md` — specialized role

**Storage:** `src/templates/` directory, each template in its own folder. When user selects a template, files are copied into the new spec's folder.

**UI:** Template picker shown during spec creation (optional — "Start from template" dropdown).

**CLI:** `nspec init <name> --template rest-api`

## Files to change

| File | Change |
|---|---|
| `src/prompts.ts` | Add `requirements-from-design` template, bugfix stage templates |
| `src/specManager.ts` | Support `generationMode: "design-first"` and `"bugfix"` in config |
| `src/SpecPanelProvider.ts` | UI for design-first toggle, bugfix stages, template picker |
| `bin/nspec.mjs` | `--type bugfix`, `--template`, `backfill` command |
| `src/templates/` | Template folder contents |

## Implementation order

1. Design-first workflow (config + prompts + UI toggle + CLI)
2. Bugfix spec type (prompts + config + UI stages + CLI)
3. Templates gallery (template files + picker UI + CLI flag)

## Success criteria

- [ ] Design-first: `nspec init my-api --mode design-first` + generate design from description works
- [ ] Design-first: Backfill requirements from a design doc produces valid requirements
- [ ] Bugfix: `nspec init login-bug --type bugfix` creates bugfix pipeline
- [ ] Bugfix: Full pipeline produces root-cause → fix-design → regression-tasks → verify
- [ ] Templates: `nspec init my-api --template rest-api` scaffolds with REST API prompts/sections
- [ ] Templates: Panel shows template picker with at least 3 options
