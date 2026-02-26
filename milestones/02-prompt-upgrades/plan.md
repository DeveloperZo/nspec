# Milestone 02: Prompt Upgrades

> EARS notation, requirement-to-task traceability, improved cascade drift — pure prompt changes, no architecture

## Why

PARITY.md Sections 3 and 5 identify two format gaps that are purely prompt-level:
1. Kiro enforces EARS notation for unambiguous requirements — nSpec uses plain prose
2. Kiro's tasks.md cross-references `_Requirements: N.N_` per task — nSpec defers this to Verify

Both are 1-day changes to `src/prompts.ts`. No new files, no new architecture.

## Deliverables

### A. EARS requirements notation

Update the `requirements` template in `TEMPLATES` to enforce EARS syntax.

**Current:**
```
Functional Requirements — numbered (FR-1, FR-2…), use MUST/SHOULD/MAY
```

**Target:**
```
Functional Requirements — numbered (FR-1, FR-2…), each with:
  - A User Story (As a <role>, I want <goal> so that <benefit>)
  - Acceptance Criteria in EARS notation:
    WHEN <event> THE SYSTEM SHALL <behavior>
    IF <precondition> THEN THE SYSTEM SHALL <behavior>
    WHILE <state> THE SYSTEM SHALL <behavior>
    THE SYSTEM SHALL <ubiquitous requirement>
    WHERE <feature> THE SYSTEM SHALL <behavior>
```

**Guidelines additions:**
- Each acceptance criterion MUST use one of the five EARS templates
- Do not use vague verbs (support, handle, manage) — EARS forces specificity
- Keep to 5-10 FRs with 2-4 acceptance criteria each

**Impact:** Requirements become formally unambiguous. Verify stage can check EARS compliance. Agents parsing requirements get structured, predictable input.

### B. Requirement-to-task traceability

Update the `tasks` template in `TEMPLATES` to emit requirement cross-references.

**Current format:**
```
- [ ] Set up project structure (S)
```

**Target format:**
```
- [ ] Set up project structure (S) _Requirements: FR-1, FR-3_
```

**Template change:**
Add to tasks template guidelines:
```
- Every task MUST end with _Requirements: FR-N, FR-N_ listing which FRs it addresses
- A task may cover multiple FRs. Every FR must appear in at least one task.
- If a task has no FR mapping, it is infrastructure — mark it _Requirements: infrastructure_
```

**Impact:** Verify stage coverage matrix becomes deterministic (parse `_Requirements:` fields) rather than AI-inferred. Agents can programmatically check coverage.

### C. Verify prompt tightening

Update the `verify` template to leverage the new structured formats:

- Parse EARS compliance: flag any acceptance criterion that doesn't match an EARS template
- Parse `_Requirements:` fields from tasks.md: build coverage matrix from data, not inference
- Add Cascade Drift as a first-class check: requirements → design component mapping, design → task mapping

**New verify section:**
```
EARS Compliance — list any acceptance criteria that do not follow EARS templates
```

## Files to change

| File | Change |
|---|---|
| `src/prompts.ts` | Update `SECTIONS.requirements`, `TEMPLATES.requirements`, `TEMPLATES.tasks`, `SECTIONS.verify` |
| `src/core/prompts.ts` | Same file after Milestone 01 extraction (or update in place if 01 not done yet) |

## Implementation order

1. Update requirements template + sections (EARS)
2. Update tasks template (traceability)
3. Update verify sections (EARS compliance check)
4. Run test-harness with before/after comparison to validate output quality

## Success criteria

- [ ] Generated requirements use EARS notation for all acceptance criteria
- [ ] Generated tasks include `_Requirements: FR-N` on every checkbox line
- [ ] Verify stage coverage matrix is built from parsed `_Requirements:` fields
- [ ] Health score improves (or stays stable) on existing test specs
- [ ] Harness comparison: `diff` between v1 and v2 outputs shows structural improvement
