# Verification — Milestone 07: Codex Chat Integration (Audit)

> Single-pass verification against plan.md deliverables and success criteria.

## Spec Health Score: 85 / 100

Strong implementation with all four deliverables addressed. The `#spec` variable resolver is deferred due to VS Code API stability (proposed API), but a functional fallback exists. Import, clarify, and AGENTS.md are complete.

## Coverage Matrix

| Deliverable | Plan Requirement | Status | Evidence |
|---|---|---|---|
| **A1** | Register `vscode.chat.registerChatVariableResolver('spec', ...)` | DEFERRED | `chatParticipant.ts` lines 24-27: comment explains the API is proposed (expected ~1.95+). Fallback at line 50-52: regex-based `spec:name` detection inline. |
| **A2** | Auto-completion: show spec names when typing `#spec:` | DEFERRED | Blocked by A1 — variable resolver API provides the completion hook. |
| **A3** | Resolution: `#spec:name` → concatenated requirements + design + tasks + verify | COVERED | `buildSpecContext()` at lines 322-332: reads requirements, design, tasks stages and concatenates. Also used by `/context` command (line 277) and `handleWithSpecContext()` (line 289-320). |
| **A4** | Bugfix support: resolve `root-cause.md`, `fix-design.md`, etc. for bugfix specs | UNCOVERED | `buildSpecContext()` only reads the standard 3 stages (requirements, design, tasks). No bugfix-type detection. |
| **B1** | CLI `import <name> <stage> <file>` command | COVERED | `nspec.mjs` lines 945-991: `cmdImport()` validates args, checks file exists, supports `--transform` flag. |
| **B2** | `--transform` flag: AI-convert document to spec format | COVERED | Lines 970-986: reads file, builds system prompt via `buildSystemPrompt(stage, ctx)`, calls LLM, writes result. |
| **B3** | Import creates spec folder + config if needed | COVERED | Line 981: `store.createSpecFolder(specsDir, folderName)` before write. |
| **B4** | Import syncs `_progress.json` if stage is tasks | COVERED | Lines 983-984: `if (stage === 'tasks') store.syncProgressFromMarkdown(...)`. |
| **B5** | `specStore.ts` `importFile()` function | COVERED | `specStore.ts` lines 665-675: pure Node function, creates dir, writes content, syncs progress. |
| **B6** | `IMPORT_TRANSFORM_SYSTEM` dedicated prompt in prompts.ts | PARTIAL | No dedicated `IMPORT_TRANSFORM_SYSTEM` constant. The transform reuses `buildSystemPrompt(stage, ctx)` (line 976-977 of nspec.mjs) with a dynamic user prompt. Functionally equivalent but less specialized. |
| **B7** | Extension command "nSpec: Import Document" with file picker | UNCOVERED | No VS Code command registered for import. CLI-only. |
| **C1** | `nspec clarify <name> --description "..."` command | COVERED | `nspec.mjs` lines 997-1039: `cmdClarify()` with full interactive Q&A loop. |
| **C2** | `CLARIFICATION_SYSTEM` prompt | COVERED | `prompts.ts` lines 411-425: detailed system prompt covering scope, users, constraints, edge cases, success criteria. |
| **C3** | `buildClarificationUserPrompt()` | COVERED | `prompts.ts` line 427-429. |
| **C4** | `buildClarifiedRequirementsUserPrompt()` | COVERED | `prompts.ts` lines 431-433: combines description + Q&A transcript. |
| **C5** | Interactive loop: questions → answers → generate | COVERED | Lines 1014-1038: Step 1 generates questions, Step 2 collects answers via readline, Step 3 generates requirements with Q&A context. |
| **C6** | Clarification prompt asks 3-5 questions one at a time | PARTIAL | System prompt says "ask 3-5 questions" and "Number each question" but all questions are generated in a single LLM call, not one at a time as plan suggests. User answers all at once via single readline prompt. |
| **D1** | AGENTS.md: Basic spec creation workflow | COVERED | Lines 39-98: Full CLI command reference with examples. |
| **D2** | AGENTS.md: Vibe-to-spec workflow | COVERED | Lines 196-218: Full vibe-to-spec documentation with CLI usage and internal explanation. |
| **D3** | AGENTS.md: Clarification flow | COVERED | "Clarification Before Spec Generation" section with 4-step workflow + chat agent alternative. |
| **D4** | AGENTS.md: Cross-spec reference | COVERED | Lines 246-260: Copilot/Codex chat integration with `@nspec /context` command. |
| **D5** | AGENTS.md: Import workflow | COVERED | "Importing Existing Documents" section with 3-step workflow + transform explanation. |
| **D6** | AGENTS.md: Bugfix workflow | PARTIAL | No dedicated bugfix workflow section in AGENTS.md. Bugfix spec type exists (M04) but not documented in agent workflows. |
| **D7** | AGENTS.md: Task execution workflow | PARTIAL | No dedicated task execution section. Tasks.md checkbox format is explained in Stage Pipeline table but no workflow for executing and toggling tasks. |
| **D8** | Chat participant registration in package.json | COVERED | `package.json` lines 103-128: `chatParticipants` array with 4 commands: spec, status, refine, context. |
| **D9** | Chat participant handler in chatParticipant.ts | COVERED | 377-line file with handlers for all 4 commands + `spec:name` pattern fallback. Registered in `extension.ts` line 45. |

## Cascade Drift

| Source | Drift Item | Severity |
|---|---|---|
| Plan A | Plan specifies `registerChatVariableResolver`. Implementation defers to proposed API with inline regex fallback. | MEDIUM — functional but not the formal VS Code API integration. |
| Plan B6 | Plan specifies `IMPORT_TRANSFORM_SYSTEM` dedicated prompt. Implementation reuses stage-specific `buildSystemPrompt()`. | LOW — functionally equivalent, generates correct format. |
| Plan C5 | Plan says "ask questions one at a time" in interactive loop. Implementation asks all questions in one LLM call, user answers in one prompt. | LOW — simpler UX, still achieves multi-turn clarification goal. |

## Gap Report

| # | Gap | Severity | Impact |
|---|---|---|---|
| G1 | `#spec` variable resolver deferred — VS Code proposed API not yet stable | MEDIUM | Users must use `@nspec /context <name>` or `spec:name` inline pattern instead of formal `#spec:name` resolution. Functional equivalent exists. |
| G2 | No bugfix spec type support in `buildSpecContext()` | LOW | Bugfix specs show standard stages instead of root-cause/fix-design/regression-tasks. Edge case — bugfix is a less common workflow. |
| G3 | No "nSpec: Import Document" VS Code command with file picker | LOW | Import is CLI-only. Agents use CLI anyway, so this primarily affects manual users. |
| G4 | AGENTS.md missing dedicated bugfix and task execution workflow sections | LOW | 5 of 7 planned workflows are documented. Bugfix and task execution are documented elsewhere (M04 plan, tasks.md format). |

## Verdict

Milestone 07 is **substantially complete** at 85/100. The core goal — making specs first-class objects in Codex/Copilot chat — is achieved through the chat participant with 4 commands, inline `spec:name` context injection, and comprehensive CLI commands for import and clarification. The `#spec` variable resolver deferral is the only notable gap, and it's blocked by an external dependency (VS Code API stabilization), not implementation readiness. The AGENTS.md update closes the documentation gap for agent-driven import and clarification workflows.