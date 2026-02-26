# Milestone 05: Structural Additions

> Hooks, multi-turn clarification, cross-spec referencing, import command

## Why

These are the features from PARITY.md Sections 8, 2, 16, and 15 that require architectural additions — new subsystems, not just prompt or config changes. Each is independently valuable but more complex than Milestones 02-04.

## Deliverables

### A. Hooks system

Event-driven automations triggered by file system events.

**Architecture:**
```
.specs/hooks/
├── update-tests.json
├── refresh-docs.json
└── lint-check.json
```

**Hook definition format:**
```json
{
  "name": "Update tests on component save",
  "trigger": "onSave",
  "glob": "src/components/**/*.tsx",
  "action": "nspec refine ${specName} tasks --feedback 'Update test tasks for changed component: ${filePath}'"
}
```

**Trigger types:**
- `onSave` — `vscode.workspace.onDidSaveTextDocument`
- `onCreate` — `vscode.workspace.onDidCreateFiles`
- `onDelete` — `vscode.workspace.onDidDeleteFiles`
- `manual` — invoked via CLI or command palette

**Action types (v1 — keep it simple):**
- Shell command execution (most flexible, Codex/Claude can run anything)
- `nspec` CLI command (refine, verify, cascade)
- Template variables: `${filePath}`, `${specName}`, `${fileName}`, `${workspaceRoot}`

**What this is NOT (v1):** Not an AI agent that reads/writes code autonomously. The hook runs a command. If that command is `codex "update tests for ${filePath}"`, that's the agent's job, not nSpec's.

**Extension integration:**
- File watchers registered in `extension.ts` on activation
- Load hook definitions from `.specs/hooks/*.json`
- Re-scan on hook file changes
- Status bar indicator when hooks are active
- Output channel for hook execution logs

**CLI:** `nspec hooks list`, `nspec hooks run <name>`

### B. Multi-turn clarification

Instead of single-shot requirements generation, open an interactive clarification chat before generating.

**Flow:**
```
User provides spec name + description
  ↓
AI asks 3-5 clarifying questions (scope, users, constraints, edge cases)
  ↓
User answers (one round or multiple)
  ↓
AI generates requirements from description + Q&A transcript
```

**Implementation:**
- New system prompt: `CLARIFICATION_SYSTEM` — asks focused questions about scope, target users, constraints, edge cases, success criteria
- Chat UI reused from the existing Refine bar — same `chatHistory` mechanism
- After clarification, the full transcript is prepended to the feature description when generating requirements
- User can skip clarification (current behavior preserved as default)

**UI:** Toggle in spec creation modal: "Ask me clarifying questions first" checkbox. When enabled, the panel opens in a chat view before generation starts.

**CLI:** `nspec clarify <name> --description "..."` — interactive Q&A in terminal, then auto-generates requirements.

### C. Cross-spec referencing

Allow one spec to reference another during refinement or generation.

**Mechanism:** When generating or refining, optionally include content from other specs as additional context.

**CLI:** `nspec generate <name> design --context other-spec-name`
This reads `other-spec-name/requirements.md` and `other-spec-name/design.md` and appends them as reference context.

**Extension:** "Include context from..." dropdown in the generate/refine UI. Lists other specs in the workspace.

**Prompt injection:**
```
---
## Reference: other-spec-name

### Requirements
(content of other spec's requirements.md)

### Design
(content of other spec's design.md)

---
Consider the above reference spec when generating. Ensure consistency with its design decisions and avoid duplicating functionality it already covers.
```

### D. Import command

Explicit UI for importing an existing document as a spec stage.

**CLI:** `nspec import <name> <stage> <file>`
- Copies `<file>` content into `.specs/<name>/<stage>.md`
- Creates spec folder + config if needed
- Syncs progress if stage is tasks

**Extension:** "Import..." button in sidebar. Opens file picker, asks which stage to import as.

**Stretch — AI-assisted import:**
`nspec import <name> requirements <file> --transform`
Reads the file, sends it to AI with a prompt: "Convert this document into our requirements format (EARS notation, FR numbering)."
Useful for importing PRDs, Notion exports, or Confluence pages.

## Files to change

| File | Change |
|---|---|
| `src/extension.ts` | Hook file watchers, hook execution |
| `src/core/hooks.ts` | New: hook definition loading, glob matching, action execution |
| `src/prompts.ts` | `CLARIFICATION_SYSTEM` prompt |
| `src/SpecPanelProvider.ts` | Clarification chat UI, cross-spec context picker, import button |
| `src/specManager.ts` | Cross-spec content loading, import file copying |
| `bin/nspec.mjs` | `hooks`, `clarify`, `import` commands, `--context` flag |

## Implementation order

1. **Import command** — simplest, high utility, no new subsystems
2. **Cross-spec referencing** — prompt-level, extends existing generate flow
3. **Multi-turn clarification** — new prompt + chat flow reuse
4. **Hooks system** — most complex, needs file watchers + execution + config

## Success criteria

- [ ] Hooks: `.specs/hooks/update-tests.json` triggers a shell command on `.tsx` file save
- [ ] Hooks: `nspec hooks list` shows active hooks with trigger info
- [ ] Clarification: Creating a spec with clarification enabled asks 3-5 questions before generating
- [ ] Clarification: Generated requirements quality improves (measured via verify health score)
- [ ] Cross-spec: `nspec generate api-v2 design --context api-v1` produces design aware of v1
- [ ] Import: `nspec import my-feature requirements ./existing-prd.md` creates spec from file
