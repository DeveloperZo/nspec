# Milestone 07: Codex Chat Integration

> #spec context provider, chat-based import, multi-turn clarification via Codex

## Why

PARITY.md remaining gaps: Kiro has `#spec` cross-referencing in chat, active import via chat instruction, and multi-turn clarification before generation. nSpec has none of these.

The end-state assumes **OpenAI Codex** as the chat participant and context provider in VS Code. Rather than building a standalone chat UI inside nSpec's webview (as M05-B originally planned), this milestone integrates nSpec directly with Codex's chat infrastructure — making specs first-class objects that Codex can read, reference, and act on.

This supersedes M05-B (multi-turn clarification) and M05-C (cross-spec referencing) with a Codex-native approach. M05-A (hooks) and M05-D (import) remain independent.

## Architecture

```
┌────────────────────────────────────────────────────┐
│  Codex Chat Panel (VS Code)                        │
│                                                    │
│  User: "implement task 2.3 from #spec:user-auth"   │
│         ↓                                          │
│  Codex resolves #spec:user-auth                    │
│    → reads requirements.md + design.md + tasks.md  │
│    → injects as context                            │
│    → executes task with full spec awareness        │
│                                                    │
│  User: "import my-prd.md as requirements for       │
│          a new spec called checkout-flow"           │
│         ↓                                          │
│  Codex reads AGENTS.md → runs nspec import     │
│                                                    │
│  User: "help me think through the requirements     │
│          for a notification system"                 │
│         ↓                                          │
│  Codex asks clarifying questions, then runs         │
│  nspec vibe-to-spec with the transcript        │
└────────────────────────────────────────────────────┘
```

**Key insight:** With Codex as the chat participant, nSpec doesn't need to build its own chat UI. Instead, nSpec provides:
1. **Structured data** (spec files) that Codex can reference
2. **CLI commands** that Codex can invoke
3. **AGENTS.md instructions** that teach Codex the workflows
4. **A context provider** that makes `#spec` resolution automatic

## Deliverables

### A. #spec context provider

Register a VS Code chat context provider so `#spec:name` resolves to spec content in any chat session.

**API:** `vscode.chat.registerChatVariableResolver()`

**Resolution:**
```
#spec:user-auth  →  resolves to:
  --- Spec: user-auth ---
  ## Requirements
  (content of .specs/user-auth/requirements.md)
  ## Design
  (content of .specs/user-auth/design.md)
  ## Tasks
  (content of .specs/user-auth/tasks.md)
  ## Verify
  (content of .specs/user-auth/verify.md)
  ---
```

**Implementation in `extension.ts`:**
```typescript
const resolver = vscode.chat.registerChatVariableResolver('spec', {
  resolve: async (name, context, token) => {
    const specsRoot = getSpecsRoot();
    const specDir = path.join(specsRoot, name);
    // Read all stages, concatenate
    const stages = ['requirements', 'design', 'tasks', 'verify'];
    let content = `--- Spec: ${name} ---\n`;
    for (const stage of stages) {
      const filePath = path.join(specDir, `${stage}.md`);
      if (fs.existsSync(filePath)) {
        content += `\n## ${stage}\n${fs.readFileSync(filePath, 'utf-8')}\n`;
      }
    }
    return [{ level: 'full', value: content }];
  }
});
```

**Auto-completion:** When user types `#spec:`, show a list of available spec names from the `.specs/` directory.

**Bugfix support:** If spec is a bugfix type, resolve `root-cause.md`, `fix-design.md`, `regression-tasks.md` instead.

### B. Import via chat instruction

Teach Codex to import existing documents as spec stages via AGENTS.md + a new CLI command.

**New CLI command:** `nspec import <name> <stage> <file> [--transform]`

**Behavior:**
1. Read `<file>` content
2. If `--transform`: send to AI with a prompt that converts the document into nSpec's format (Given/When/Then for requirements, FR numbering, etc.)
3. Write result to `.specs/<name>/<stage>.md`
4. Create spec folder + `spec.config.json` if needed
5. If stage is tasks: initialize `_progress.json`

**Transform prompt in `core/prompts.ts`:**
```
IMPORT_TRANSFORM_SYSTEM:
You are converting an existing document into nSpec's requirements format.
The input document may be a PRD, PRFAQ, Notion export, Confluence page, or any text.

Convert it to the following format:
- Functional Requirements numbered FR-1, FR-2, ...
- Each FR has a User Story and Acceptance Criteria in Given/When/Then format
- Non-functional requirements in a separate section
- Maintain all original intent — do not add or remove requirements
```

**AGENTS.md update:**
```
## Importing Existing Documents
When the user says "import this document as requirements" or similar:
1. nspec import <name> requirements <file> --transform
2. The document will be converted to nSpec's requirements format
3. Then cascade: nspec cascade <name>
```

**Extension command:** `nSpec: Import Document` — opens file picker, asks for spec name and target stage.

### C. Multi-turn clarification via Codex

Instead of building a clarification chat UI inside nSpec's webview, leverage Codex as the clarification agent.

**Approach:** The clarification happens naturally in Codex chat. AGENTS.md instructs Codex on how to run a clarification flow before spec generation:

**AGENTS.md update:**
```
## Clarification Before Spec Generation
When the user asks to create a spec for a complex feature:
1. Ask 3-5 clarifying questions about:
   - Scope boundaries (what's in vs out)
   - Target users and personas
   - Technical constraints or preferences
   - Edge cases and error handling expectations
   - Success criteria and acceptance testing approach
2. After the user answers, save the full conversation to a temp file
3. Run: nspec vibe-to-spec --name <name> --transcript <file> --cascade
4. This generates the full spec pipeline informed by the clarification Q&A
```

**CLI support:** `nspec clarify <name> --description "..."` for terminal-based interactive clarification (non-Codex fallback).

**Clarification prompt in `core/prompts.ts`:**
```
CLARIFICATION_SYSTEM:
You are a requirements analyst preparing to generate a software specification.
Given a brief feature description, ask 3-5 focused clarifying questions.

Questions should cover:
1. Scope — what is included vs excluded
2. Users — who are the primary and secondary users
3. Constraints — technical, business, or time constraints
4. Edge cases — what happens in failure scenarios
5. Success criteria — how will we know this feature is complete

Ask questions one at a time. After the user answers, ask the next.
When you have enough context, summarize what you learned and confirm readiness to generate.
```

**Implementation:** The `clarify` command runs an interactive loop:
1. Send description + `CLARIFICATION_SYSTEM` → get first question
2. Print question, read user input
3. Append to transcript, send for next question
4. After 3-5 rounds (or user says "done"), pass full transcript to vibe-to-spec

### D. AGENTS.md comprehensive update

Rewrite the spec workflows section of AGENTS.md to document all Codex-integrated workflows:

1. **Basic spec creation** — `nspec init` + `nspec generate` + `nspec cascade`
2. **Vibe-to-spec** — capture chat context → `nspec vibe-to-spec`
3. **Clarification flow** — ask questions → vibe-to-spec with transcript
4. **Cross-spec reference** — use `#spec:name` in chat for context
5. **Import workflow** — `nspec import` with `--transform`
6. **Bugfix workflow** — `nspec init --type bugfix` + `bugfix-cascade`
7. **Task execution** — read tasks.md, execute tasks, toggle checkboxes

## Files to change

| File | Change |
|---|---|
| `src/extension.ts` | Register `#spec` variable resolver, import command, clarify command |
| `src/core/prompts.ts` | `IMPORT_TRANSFORM_SYSTEM`, `CLARIFICATION_SYSTEM` prompts |
| `src/core/specStore.ts` | `importStage()` function, `clarify()` interactive loop |
| `bin/nspec.mjs` | `import`, `clarify` commands |
| `src/specManager.ts` | Wrappers for import, variable resolver helpers |
| `src/SpecPanelProvider.ts` | Import button in sidebar, "imported from" banner |
| `package.json` | New command registrations, `chatVariables` contribution |
| `AGENTS.md` | Comprehensive rewrite of workflow documentation |

## Implementation order

1. **#spec context provider** — register variable resolver in extension.ts, add auto-completion
2. **Import CLI command** — `nspec import` with `--transform` flag
3. **Import extension command** — file picker UI, "Import..." button
4. **Clarification CLI** — `nspec clarify` interactive loop
5. **AGENTS.md rewrite** — comprehensive workflow documentation for Codex

## Success criteria

- [ ] Typing `#spec:my-feature` in Codex chat injects the full spec content as context
- [ ] Auto-complete shows available spec names when typing `#spec:`
- [ ] `nspec import my-api requirements ./prd.md --transform` converts a PRD to Given/When/Then format
- [ ] `nspec import my-api design ./arch-notes.md` copies file content as design stage
- [ ] Extension command "nSpec: Import Document" opens file picker and creates spec
- [ ] `nspec clarify my-feature --description "add auth"` asks 3-5 questions interactively
- [ ] AGENTS.md documents all 7 Codex-integrated workflows
- [ ] Codex can autonomously run: clarify → vibe-to-spec → cascade from a single user request
