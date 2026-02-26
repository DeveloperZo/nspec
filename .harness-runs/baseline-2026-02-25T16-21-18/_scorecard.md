# Scorecard -- Virtual Snack Game
Run: baseline | 2026-02-25T16:24:03.775Z | claude-haiku-4-5-20251001
Input: A casual browser game where players eat virtual cookies and pair them with beverages like milk or root beer. Target audi...

## Results
| Metric | Value |
|---|---|
| Health Score | 78 / 100 |
| Functional Requirements | 33 |
| Tasks generated | 659 |
| Uncovered FRs | 2 |
| Total tokens (in/out) | ~27953 / ~22197 |
| Wall time | 165s |

## What to look at

Score is decent. Review the Gap Report in verify.md for specific misses.


2 uncovered requirement(s) -- likely a gap in the TASKS prompt.


## Prompt tuning hints
Review `_prompts/` to see exactly what was sent. Common tweaks:

- Requirements too vague? Add domain-specific sections via --steering or _sections/
- Design too generic? Add "Include code snippets for key interfaces" to DESIGN template
- Tasks missing coverage? Add "Cross-reference every FR-N" to TASKS template
- Score inflated? Add explicit deduction criteria to VERIFY template
- Score too harsh? Check if VERIFY weighting matches your priorities

## Compare runs
```bash
diff -r .harness-runs/baseline-* .harness-runs/<other-tag>-*
diff .harness-runs/baseline-*/_prompts/ .harness-runs/<other-tag>-*/_prompts/
```
