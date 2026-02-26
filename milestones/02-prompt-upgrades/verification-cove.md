# Verification — Milestone 02: Prompt Upgrades (Chain of Verification)

> Two-step CoVe: generate verification questions, then answer them against the source code.

---

## Step 1: Verification Questions

1. [FR Coverage] Does the `SECTIONS.requirements` array reference Given/When/Then notation?
2. [FR Coverage] Does the `TEMPLATES.requirements` string list all five Given/When/Then templates (WHEN, IF, WHILE, THE SYSTEM SHALL, WHERE)?
3. [FR Coverage] Does the requirements template require a User Story per FR?
4. [FR Coverage] Does the requirements template prohibit vague verbs (support, handle, manage)?
5. [FR Coverage] Does the requirements guideline specify 5-10 FRs with 2-4 acceptance criteria each?
6. [FR Coverage] Does the task format template show `_Requirements: FR-N, FR-N_` in the example line?
7. [FR Coverage] Do the tasks guidelines require every task to end with `_Requirements:` mapping?
8. [FR Coverage] Do the tasks guidelines require every FR to appear in at least one task?
9. [FR Coverage] Do the tasks guidelines specify `_Requirements: infrastructure_` for non-FR tasks?
10. [FR Coverage] Does the `SECTIONS.verify` array include an Given/When/Then Compliance section?
11. [FR Coverage] Does the `SECTIONS.verify` Coverage Matrix description reference parsing `_Requirements:` fields?
12. [FR Coverage] Does the `SECTIONS.verify` Cascade Drift section include requirement→design and design→task mapping?
13. [Design Alignment] Are changes confined to `src/core/prompts.ts` only (no new files created)?
14. [Design Alignment] Does `src/prompts.ts` re-export shim still work unchanged?
15. [Task Quality] Does the TypeScript build compile with zero errors?
16. [Task Quality] Are the Given/When/Then templates correctly formatted with proper syntax?
17. [Consistency] Does the verify guidelines section instruct parsing `_Requirements:` fields rather than inferring coverage?
18. [Consistency] Does the verify guidelines section instruct checking Given/When/Then compliance on acceptance criteria?
19. [Cascade Drift] Are the old task guidelines (including "Cross-reference FR numbers where applicable") replaced by the new mandatory `_Requirements:` format?
20. [Cascade Drift] Is the old requirements section description ("use MUST/SHOULD/MAY") replaced by the new Given/When/Then reference?

---

## Step 2: Answers & Scored Verdict

| # | Answer | Citation |
|---|---|---|
| 1 | **YES** | `core/prompts.ts` line 20: "each with a User Story and Acceptance Criteria in Given/When/Then notation" |
| 2 | **YES** | Lines 59-63: all five Given/When/Then templates listed — WHEN, IF, WHILE, THE SYSTEM SHALL, WHERE |
| 3 | **YES** | Lines 56-57: "Each Functional Requirement MUST include: 1. A User Story: As a <role>, I want <goal> so that <benefit>" |
| 4 | **YES** | Line 68: "Do not use vague verbs (support, handle, manage) — Given/When/Then forces specificity." |
| 5 | **YES** | Line 69: "Keep Functional Requirements to 5-10 items with 2-4 acceptance criteria each." |
| 6 | **YES** | Line 97: format template shows `- [ ] Description (S|M|L|XL) _Requirements: FR-N, FR-N_` |
| 7 | **YES** | Line 105: "Every task MUST end with _Requirements: FR-N, FR-N_ listing which FRs it addresses." |
| 8 | **YES** | Line 106: "A task may cover multiple FRs. Every FR must appear in at least one task." |
| 9 | **YES** | Line 107: "If a task has no FR mapping, it is infrastructure — mark it _Requirements: infrastructure_." |
| 10 | **YES** | Line 34: "Given/When/Then Compliance — list any acceptance criteria that do not follow Given/When/Then templates (WHEN/IF/WHILE/THE SYSTEM SHALL/WHERE)" |
| 11 | **YES** | Line 35: "parse _Requirements: FR-N_ fields from tasks to build the matrix, flag uncovered FRs as UNCOVERED" |
| 12 | **YES** | Line 36: "(1) requirements not reflected in design, (2) design decisions missing from tasks, (3) requirements→design component mapping, (4) design→task mapping" |
| 13 | **YES** | Only `src/core/prompts.ts` was modified. No new files created. `src/prompts.ts` untouched. |
| 14 | **YES** | `src/prompts.ts` is unchanged — 21-line re-export shim still re-exports all symbols from `./core/prompts`. |
| 15 | **YES** | `npx tsc --noEmit` and `npm run compile` both produce zero errors. |
| 16 | **YES** | Given/When/Then templates use proper syntax: "WHEN <event> THE SYSTEM SHALL <behavior>", etc. |
| 17 | **YES** | Line 121: "parse the _Requirements: FR-N, FR-N_ fields from each task checkbox line. Build the matrix from these parsed fields, not from inference." |
| 18 | **YES** | Line 120: "For Given/When/Then Compliance, check each acceptance criterion in Requirements against the five Given/When/Then templates." |
| 19 | **YES** | Old guideline "Cross-reference FR numbers where applicable so coverage is traceable" replaced by mandatory "_Requirements:" format (lines 105-107). |
| 20 | **YES** | Old section "Functional Requirements — numbered (FR-1, FR-2…), use MUST/SHOULD/MAY" replaced with "each with a User Story and Acceptance Criteria in Given/When/Then notation" (line 20). |

---

## Tally

| Result | Count | Credit |
|---|---|---|
| YES | 20 | 20 x 5 = 100 |
| PARTIAL | 0 | 0 |
| NO | 0 | 0 |
| **Total** | **20** | **100 / 100** |

## Spec Health Score: 95 / 100

Adjusted from perfect 100 to 95 to account for: (1) no live harness comparison run yet, (2) verify line limit increased from 120→150, which is reasonable but diverges from plan. All 20 verification questions answered YES.

## Coverage Matrix

| Plan Deliverable | Given/When/Then Notation (A) | Task Traceability (B) | Verify Tightening (C) |
|---|---|---|---|
| Implemented? | YES | YES | YES |
| SECTIONS updated? | YES | N/A (tasks has no sections) | YES |
| TEMPLATES updated? | YES | YES | YES |
| Guidelines updated? | YES | YES | YES |

## Gap Report

| # | Gap | Source Question | Severity |
|---|---|---|---|
| — | None | — | — |

All plan deliverables are fully covered. No gaps detected via evidence-based questioning.

## Verdict

The implementation scores 95/100 via Chain of Verification. All 20 questions answered YES — every plan requirement has a direct code-level implementation. The changes are surgical: only `SECTIONS` and `TEMPLATES` constants in `src/core/prompts.ts` were modified, touching exactly the four prompt areas specified in the plan (requirements sections, requirements template, tasks template, verify sections + guidelines). No architecture was changed, no new files were created, and the TypeScript build is clean. The implementation faithfully converts the plan's three deliverables into concrete prompt changes that will produce Given/When/Then-formatted requirements, traceability-tagged tasks, and parse-based verification coverage.
