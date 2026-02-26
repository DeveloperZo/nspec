# Scorecard -- Virtual Snack Game
Run: v3-committee | 2026-02-25T19:57:08.441Z | claude-haiku-4-5-20251001
Verify: committee
Input: (from input-dir)

## Results
| Metric | Value |
|---|---|
| Health Score | ? / 100 |
| Verify Scheme | committee |
| Functional Requirements | 16 |
| Tasks generated | 50 |
| Uncovered FRs | 0 |
| Total tokens (in/out) | ~19669 / ~5958 |
| Wall time | 58s |

## Prompt tuning hints
Review `_prompts/` to see exactly what was sent. Common tweaks:

- Requirements too vague? Add domain-specific sections via --steering or _sections/
- Design too generic? Add "Include code snippets for key interfaces" to DESIGN template
- Tasks missing coverage? Add "Cross-reference every FR-N" to TASKS template
- Score inflated? Try --verify-scheme committee for multi-perspective scoring
- Verify too lenient? Try --verify-scheme cove for evidence-based verification

## Compare runs
```bash
diff -r .harness-runs/v3-committee-* .harness-runs/<other-tag>-*
```
