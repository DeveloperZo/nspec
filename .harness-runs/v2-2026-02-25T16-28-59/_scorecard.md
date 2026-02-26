# Scorecard -- Virtual Snack Game
Run: v2 | 2026-02-25T16:30:13.301Z | claude-haiku-4-5-20251001
Input: A casual browser game where players eat virtual cookies and pair them with beverages like milk or root beer. Target audi...

## Results
| Metric | Value |
|---|---|
| Health Score | 87 / 100 |
| Functional Requirements | 16 |
| Tasks generated | 50 |
| Uncovered FRs | 0 |
| Total tokens (in/out) | ~8452 / ~7231 |
| Wall time | 74s |

## What to look at

Score is decent. Review the Gap Report in verify.md for specific misses.





## Prompt tuning hints
Review `_prompts/` to see exactly what was sent. Common tweaks:

- Requirements too vague? Add domain-specific sections via --steering or _sections/
- Design too generic? Add "Include code snippets for key interfaces" to DESIGN template
- Tasks missing coverage? Add "Cross-reference every FR-N" to TASKS template
- Score inflated? Add explicit deduction criteria to VERIFY template
- Score too harsh? Check if VERIFY weighting matches your priorities

## Compare runs
```bash
diff -r .harness-runs/v2-* .harness-runs/<other-tag>-*
diff .harness-runs/v2-*/_prompts/ .harness-runs/<other-tag>-*/_prompts/
```
