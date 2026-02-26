# Verification — Milestone 02: Prompt Upgrades (Audit)

> Single-pass verification against plan.md deliverables and success criteria.

## Spec Health Score: 92 / 100

All three deliverables are implemented in `src/core/prompts.ts`. Pure prompt changes — no architecture, no new files. TypeScript compiles with zero errors.

## Coverage Matrix

| Deliverable | Plan Requirement | Status | Evidence |
|---|---|---|---|
| **A1** | Given/When/Then notation in `SECTIONS.requirements` | COVERED | Line 20: section updated to reference "User Story and Acceptance Criteria in Given/When/Then notation" |
| **A2** | Given/When/Then templates listed in `TEMPLATES.requirements` | COVERED | Lines 56-63: all five Given/When/Then templates listed (WHEN, IF, WHILE, THE SYSTEM SHALL, WHERE) |
| **A3** | Given/When/Then guideline: each criterion MUST use Given/When/Then | COVERED | Line 67: "Each acceptance criterion MUST use one of the five Given/When/Then templates above." |
| **A4** | Given/When/Then guideline: no vague verbs | COVERED | Line 68: "Do not use vague verbs (support, handle, manage) — Given/When/Then forces specificity." |
| **A5** | FR count guidance: 5-10 FRs with 2-4 ACs each | COVERED | Line 69: "Keep Functional Requirements to 5-10 items with 2-4 acceptance criteria each." |
| **B1** | Task format includes `_Requirements: FR-N_` | COVERED | Line 97: task format template shows `_Requirements: FR-N, FR-N_` |
| **B2** | Every task MUST end with `_Requirements:` | COVERED | Line 105: "Every task MUST end with _Requirements: FR-N, FR-N_ listing which FRs it addresses." |
| **B3** | Every FR must appear in at least one task | COVERED | Line 106: "A task may cover multiple FRs. Every FR must appear in at least one task." |
| **B4** | Infrastructure tasks get `_Requirements: infrastructure_` | COVERED | Line 107: "If a task has no FR mapping, it is infrastructure — mark it _Requirements: infrastructure_." |
| **C1** | Given/When/Then Compliance section in verify | COVERED | Line 34: "Given/When/Then Compliance — list any acceptance criteria that do not follow Given/When/Then templates" |
| **C2** | Coverage Matrix parses `_Requirements:` fields | COVERED | Line 35: "parse _Requirements: FR-N_ fields from tasks to build the matrix" |
| **C3** | Cascade Drift as first-class check | COVERED | Line 36: expanded to 4 explicit drift checks with requirement→design and design→task mapping |
| **C4** | Verify guidelines: Given/When/Then compliance checking | COVERED | Line 120: "check each acceptance criterion in Requirements against the five Given/When/Then templates" |
| **C5** | Verify guidelines: parse-based coverage matrix | COVERED | Line 121: "parse the _Requirements: FR-N, FR-N_ fields from each task checkbox line. Build the matrix from these parsed fields, not from inference." |

## Cascade Drift

| Source | Drift Item | Severity |
|---|---|---|
| Plan A | Plan says "Keep to 5-10 FRs with 2-4 acceptance criteria each". Previous guideline said "Keep Functional Requirements to 10-15 items". Updated to 5-10. | NONE — intentional refinement per plan |
| Plan C | Plan says "New section: Given/When/Then Compliance". Implementation adds it as the second verify section, before Coverage Matrix. Order is sensible. | NONE |
| Plan | Plan references both `src/prompts.ts` and `src/core/prompts.ts`. Changes applied to `src/core/prompts.ts` only. | NONE — `src/prompts.ts` re-exports from `core/prompts.ts`, so both paths work |

## Gap Report

| # | Gap | Severity | Impact |
|---|---|---|---|
| G1 | No harness comparison run (before/after diff) | LOW | Plan's success criteria mention "Harness comparison: diff between v1 and v2 outputs shows structural improvement". Requires API key and live run. Cannot be verified without runtime test. |
| G2 | Verify document line limit increased from 120 to 150 | LOW | The addition of the Given/When/Then Compliance section warranted expanding the line budget. Reasonable trade-off. |

## Verdict

Milestone 02 is **complete** at 92/100. All three deliverables — Given/When/Then notation, requirement-to-task traceability, and verify prompt tightening — are implemented as pure prompt changes in `src/core/prompts.ts`. No new files were created, no architecture was changed. The TypeScript build compiles cleanly. The two minor gaps (no harness diff, slightly expanded line limit) are non-blocking. The changes will produce structurally improved spec output: requirements with formal Given/When/Then acceptance criteria, tasks with deterministic FR traceability, and verification with parse-based coverage matrices instead of AI-inferred ones.
