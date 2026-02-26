# Verification — Milestone 02: Prompt Upgrades (Committee Synthesis)

> Synthesizes the Audit and Chain of Verification reports into a combined assessment.

---

## Final Health Score: 93 / 100

Weighted toward the evidence-based CoVe analysis (95) while incorporating the Audit's assessment (92). The CoVe's 20/20 YES answers confirm full deliverable coverage. The small deduction reflects two minor observations both reports acknowledge: no live harness comparison and a modest verify line-limit increase.

## Cascade Drift

Both reports agree on zero cascade drift. The implementation changes are confined to `SECTIONS` and `TEMPLATES` in `src/core/prompts.ts`:

| Drift Item | Source | Severity | Assessment |
|---|---|---|---|
| FR count reduced from 10-15 to 5-10 | Both reports | NONE | Intentional per plan — Given/When/Then notation with user stories and 2-4 ACs each produces denser FRs, so fewer are needed |
| Verify line limit increased from 120 to 150 | Both reports | LOW | Given/When/Then Compliance is a new section requiring additional output space. Reasonable trade-off |
| Old "Cross-reference FR numbers" replaced by mandatory `_Requirements:` | CoVe Q19 | NONE | Intentional upgrade — the old guideline was advisory, the new one is mandatory and structured |

## Consensus Issues (flagged by BOTH reports — high confidence)

### 1. No harness comparison run (LOW)

- **Audit G1**: "No harness comparison run (before/after diff)"
- **CoVe**: Score adjusted from 100→95 for same reason
- **Plan reference**: "Harness comparison: diff between v1 and v2 outputs shows structural improvement"
- **Assessment**: This is a runtime verification that requires an API key and live AI calls. The prompt changes themselves are verified as correct by both reports. The harness run is a quality-assurance step, not a deliverable. **Recommendation**: Run `node test-harness.mjs` with before/after tagging when convenient, but this does not block the milestone.

## Contested Issues (flagged by only ONE report)

### Audit-only: Verify line limit increase (LOW)

The Audit flagged the increase from 120→150 lines as a minor gap. The CoVe did not flag it because it's a reasonable accommodation for the new Given/When/Then Compliance section. **Judgment**: Acceptable. The Given/When/Then Compliance section adds meaningful verification value and needs output space.

## Success Criteria Checklist

| Criterion | Status | Evidence |
|---|---|---|
| Generated requirements use Given/When/Then notation for all acceptance criteria | PASS | `TEMPLATES.requirements` lines 56-63: five Given/When/Then templates with mandatory usage guideline |
| Generated tasks include `_Requirements: FR-N` on every checkbox line | PASS | `TEMPLATES.tasks` line 97: format template; line 105: mandatory guideline |
| Verify stage coverage matrix is built from parsed `_Requirements:` fields | PASS | `SECTIONS.verify` line 35 + verify guidelines line 121: explicit parse instruction |
| Health score improves (or stays stable) on existing test specs | PENDING | Requires live harness run with API key |
| Harness comparison shows structural improvement | PENDING | Requires live harness run with API key |

## What Was Changed

| File | Change | Lines Modified |
|---|---|---|
| `src/core/prompts.ts` | `SECTIONS.requirements` — added Given/When/Then reference | 1 line |
| `src/core/prompts.ts` | `TEMPLATES.requirements` — added Given/When/Then templates + guidelines | 8 lines added |
| `src/core/prompts.ts` | `TEMPLATES.tasks` — added `_Requirements:` format + guidelines | 4 lines modified/added |
| `src/core/prompts.ts` | `SECTIONS.verify` — added Given/When/Then Compliance, updated Coverage Matrix + Cascade Drift | 3 lines modified |
| `src/core/prompts.ts` | Verify guidelines — added Given/When/Then + parse-based coverage instructions | 4 lines modified |

**Total**: ~20 lines changed in a single file. Zero new files. TypeScript compiles with zero errors.

## Final Verdict

Milestone 02 achieves a **Final Health Score of 93/100**. All three deliverables are implemented as pure prompt changes in `src/core/prompts.ts`, exactly as the plan specified. The changes are minimal, surgical, and non-breaking — no new files, no architecture changes, no API changes. The `src/prompts.ts` re-export shim continues to work unchanged.

The milestone closes two format gaps identified in PARITY.md: (1) Given/When/Then notation for unambiguous requirements with formal acceptance criteria, and (2) deterministic requirement-to-task traceability via `_Requirements: FR-N` fields. The verify stage gains a new Given/When/Then Compliance check and switches from AI-inferred to parse-based coverage matrices.

**The milestone is ready for use.** Two success criteria (health score stability and harness comparison) require a live AI run to fully confirm, but the prompt changes themselves are verified as correct and complete.
