# Scorecard -- Virtual Snack Game
Run: v4-cascade | 2026-02-25T20:08:51.243Z | claude-haiku-4-5-20251001
Verify: committee
Input: Remove the personal leaderboard feature (FR-10). The game should just show the current score, not track high scores.

## Results
| Metric | Value |
|---|---|
| Health Score | 82 / 100 |
| Verify Scheme | committee |
| Functional Requirements | 15 |
| Tasks generated | 46 |
| Uncovered FRs | 0 |
| Total tokens (in/out) | ~25078 / ~11943 |
| Wall time | 99s |

## Prompt tuning hints
Review `_prompts/` to see exactly what was sent. Common tweaks:

- Requirements too vague? Add domain-specific sections via --steering or _sections/
- Design too generic? Add "Include code snippets for key interfaces" to DESIGN template
- Tasks missing coverage? Add "Cross-reference every FR-N" to TASKS template
- Score inflated? Try --verify-scheme committee for multi-perspective scoring
- Verify too lenient? Try --verify-scheme cove for evidence-based verification

## Compare runs
```bash
diff -r .harness-runs/v4-cascade-* .harness-runs/<other-tag>-*
```
