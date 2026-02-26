# Milestone 06: Vibe-to-Spec

> Convert conversational coding sessions into formal spec pipelines

## Why

PARITY.md: Kiro supports transitioning from exploratory "vibe" chat sessions into formal specs — say "Generate spec" mid-conversation and Kiro carries the context forward. nSpec has no equivalent. Every spec starts from a blank modal.

This is the bridge between unstructured exploration ("I'm thinking about adding auth to this app...") and structured planning (requirements → design → tasks → verify). The end-state assumes OpenAI Codex as the chat participant in VS Code, so the implementation must capture context from Codex chat sessions and feed it into nSpec's generation pipeline.

## Architecture

```
┌──────────────────────────────────┐
│  Codex Chat (VS Code)            │
│                                  │
│  User: "I want to add OAuth..."  │
│  Codex: "You could use..."       │
│  User: "Generate spec"           │
│  ↓                               │
│  Codex runs nSpec CLI        │
└──────────┬───────────────────────┘
           │
    ┌──────▼──────────────────────────────┐
    │  nspec vibe-to-spec             │
    │                                      │
    │  --transcript <file|stdin>           │
    │  --name <spec-name>                  │
    │  --type feature|bugfix               │
    │  --mode requirements-first|design-first │
    │                                      │
    │  1. Parse transcript → structured    │
    │     context (topic, constraints,     │
    │     decisions, open questions)        │
    │  2. Generate requirements with       │
    │     transcript as extended context   │
    │  3. Optionally cascade downstream    │
    └──────────────────────────────────────┘
```

## Deliverables

### A. Vibe-to-spec CLI command

New CLI command that accepts a conversation transcript and generates a spec from it.

**CLI:** `nspec vibe-to-spec --name <name> [--transcript <file>] [--type feature] [--mode requirements-first] [--cascade]`

**Input methods:**
- `--transcript <file>` — read from a markdown/text file
- `stdin` — pipe conversation text directly: `cat chat.md | nspec vibe-to-spec --name my-feature`
- `--transcript -` — explicit stdin marker

**Transcript format (flexible — AI parses it):**
```markdown
User: I'm thinking about adding OAuth support to the app
Assistant: There are several approaches. You could use...
User: Let's go with GitHub OAuth. We need session management too.
Assistant: For session management, I'd recommend...
```

**What happens internally:**
1. Read transcript text
2. Build a `VIBE_TO_SPEC_SYSTEM` prompt that instructs the model to:
   - Extract the feature scope from the conversation
   - Identify constraints, decisions, and open questions mentioned
   - Produce a structured feature description suitable for requirements generation
3. Generate requirements using the extracted description + full transcript as extended context
4. If `--cascade`: continue through design → tasks → verify

**New prompt in `core/prompts.ts`:**
```
VIBE_TO_SPEC_SYSTEM:
You are converting an exploratory conversation into a structured feature description.

Given a conversation transcript between a developer and an AI assistant, extract:
1. **Feature scope** — what is being built (1-2 sentence summary)
2. **Key decisions** — technology choices, architectural decisions made during the conversation
3. **Constraints** — any limitations, requirements, or non-negotiables mentioned
4. **Open questions** — anything left unresolved that should be clarified in requirements
5. **User context** — who will use this, what problem it solves

Output a structured feature description that can be fed directly into a requirements generation pipeline.
Include the key decisions and constraints as explicit inputs — do not lose information from the conversation.
```

### B. Vibe-to-spec VS Code command

A VS Code command that captures text from the active editor or clipboard and feeds it to vibe-to-spec.

**Command:** `nSpec: Generate Spec from Conversation`
- Registered as `nspec.vibeToSpec` in `package.json`
- Available in command palette

**Flow:**
1. User invokes command (via palette or keybinding)
2. Quick input asks for spec name
3. Quick pick: "From active editor selection", "From clipboard", "From file..."
4. Text is passed to `core/specStore.ts` → `vibeToSpec()` function
5. Panel opens showing the generated requirements with a banner: "Generated from conversation transcript"
6. User can refine, cascade, or discard

**AGENTS.md integration:**
Update AGENTS.md to document vibe-to-spec workflow:
```
## Vibe-to-Spec Workflow
When the user asks you to "generate a spec" or "turn this into a spec" during a conversation:
1. Save the relevant conversation context to a temporary file
2. Run: nspec vibe-to-spec --name <inferred-name> --transcript <file> --cascade
3. The spec pipeline will be generated from the conversation context
```

This is the key integration point — Codex reads AGENTS.md, learns the vibe-to-spec command, and can invoke it mid-conversation when the user says "generate a spec from this."

### C. Transcript-aware generation

When requirements are generated via vibe-to-spec, the transcript is preserved as generation context so downstream stages benefit from it.

**Implementation:**
- Store the extracted description in `spec.config.json` under `"vibeContext"` field
- When generating design/tasks, if `vibeContext` exists, append it to the workspace context
- The design stage sees decisions and constraints from the original conversation
- Verify stage can check that transcript decisions are reflected in the spec

**Config addition:**
```json
{
  "generationMode": "requirements-first",
  "vibeContext": {
    "transcript": "...(truncated)...",
    "extractedDescription": "...",
    "generatedAt": "2026-02-26T..."
  }
}
```

## Files to change

| File | Change |
|---|---|
| `src/core/prompts.ts` | Add `VIBE_TO_SPEC_SYSTEM` prompt, `buildVibeToSpecPrompt()` |
| `src/core/specStore.ts` | Add `vibeToSpec()` function, `vibeContext` config support |
| `bin/nspec.mjs` | Add `vibe-to-spec` command |
| `src/extension.ts` | Register `nspec.vibeToSpec` command |
| `src/specManager.ts` | Wrapper for `vibeToSpec()`, read clipboard/selection |
| `src/SpecPanelProvider.ts` | Handle vibe-to-spec result, show "from transcript" banner |
| `package.json` | New command registration |
| `AGENTS.md` | Document vibe-to-spec workflow for Codex |

## Implementation order

1. `VIBE_TO_SPEC_SYSTEM` prompt + `buildVibeToSpecPrompt()` in core/prompts.ts
2. `vibeToSpec()` function in core/specStore.ts
3. `vibe-to-spec` CLI command in nspec.mjs
4. VS Code command + quick input flow in extension.ts
5. `vibeContext` persistence in spec.config.json
6. AGENTS.md update

## Success criteria

- [ ] `echo "User: add auth\nAssistant: Use OAuth..." | nspec vibe-to-spec --name auth-feature` generates valid requirements
- [ ] `nspec vibe-to-spec --name auth --transcript chat.md --cascade` produces full spec pipeline
- [ ] VS Code command palette shows "nSpec: Generate Spec from Conversation"
- [ ] Generated spec's `spec.config.json` contains `vibeContext` with extracted description
- [ ] Design stage references decisions from the original transcript
- [ ] AGENTS.md documents vibe-to-spec so Codex can invoke it autonomously
