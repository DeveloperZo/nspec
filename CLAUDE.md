# nSpec — Claude Code Instructions

This project uses nSpec for spec-driven development. Before writing code, create structured specifications: **Requirements → Design → Tasks → Verify**. Specs live in `.specs/`.

## Slash Commands

- `/spec <name>` — Generate a full spec pipeline from the current conversation. Pipes the chat context to the vibe-to-spec CLI with cascade.
- `/spec-status [name]` — Show spec status overview, or detail for a specific spec.
- `/spec-refine <name> <stage>` — Refine a spec stage using feedback from the conversation.

## When to Generate a Spec

If the user says "generate a spec", "turn this into a spec", "create a spec from this", or similar, use the `/spec` slash command. If the slash command is not available, run manually:

```bash
echo '<conversation transcript>' | node bin/nspec.mjs vibe-to-spec <name> --cascade
```

## Environment

The CLI requires `NSPEC_API_KEY` for LLM calls. Supports OpenAI and Anthropic:

```bash
# OpenAI (default)
export NSPEC_API_KEY="sk-..."

# Anthropic
export NSPEC_API_KEY="sk-ant-..."
export NSPEC_API_BASE="https://api.anthropic.com/v1"
export NSPEC_MODEL="claude-sonnet-4-20250514"
```

## CLI Quick Reference

```bash
node bin/nspec.mjs init <name>                                        # Create empty spec
node bin/nspec.mjs generate <name> requirements --description "..."   # Generate one stage
node bin/nspec.mjs cascade <name>                                     # Generate all downstream stages
node bin/nspec.mjs verify <name> --scheme committee                   # Thorough verification
node bin/nspec.mjs refine <name> <stage> --feedback "..."             # Revise a stage
node bin/nspec.mjs status                                             # List all specs
node bin/nspec.mjs status <name>                                      # Detail view with health score
```

## Spec Structure

Each spec at `.specs/<name>/` contains:
- `requirements.md` — Functional & non-functional requirements (Given/When/Then)
- `design.md` — Technical architecture & component breakdown
- `tasks.md` — Checkbox implementation plan with effort estimates
- `verify.md` — Health score, coverage matrix, gap analysis
- `spec.config.json` — Metadata (includes `vibeContext` for conversation-generated specs)

## After Generating a Spec

1. Read `verify.md` and check the health score (target 80+)
2. If gaps exist, use `nspec refine` to address them
3. After fixes, re-cascade: `node bin/nspec.mjs cascade <name> --from design`
4. Re-verify: `node bin/nspec.mjs verify <name> --scheme committee`
