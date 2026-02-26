# Where Kiro Leads nSpec — Detailed Explanation

This document explains **where Kiro is better than nSpec** and **exactly why**, using current Kiro documentation, changelogs, and third-party sources. It supports the gap analysis in [PARITY.md](../PARITY.md).

---

## 1. Spec creation wizard (guided chat)

**Where Kiro leads:** Slightly.

**What Kiro does:**  
Kiro uses a **dedicated Kiro pane** in the sidebar with a **+** button under the Specs section. When you click it, creation starts in **chat**: Kiro asks whether you want a **Feature** or **Bug** spec, then asks for the description. The flow is **conversational** — you answer step by step instead of filling a single form.

**Why it’s better:**  
- **Incremental intent capture:** The tool drives the conversation (type first, then description), so it’s harder to skip steps or leave intent vague.  
- **Single mental mode:** You stay in “chat with the AI” instead of switching to a modal form.  
- **Natural for exploratory ideas:** If you’re not sure how to describe the feature, the back-and-forth can narrow it down before any spec text is written.

**What nSpec does instead:**  
A **modal** with spec name, description, type (Feature/Bugfix), workflow (Requirements-first/Design-first), and optional template — all in one shot. No pre-generation questions in the UI (refinement happens after generation via the Refine bar).

**Source:**  
- [Kiro Docs — Specs](https://kiro.dev/docs/specs) (sidebar + Specs creation).  
- [PARITY.md](../PARITY.md) row “Spec creation entry point” citing [A].

---

## 2. Multi-turn clarification before generation

**Where Kiro leads:** Clearly.

**What Kiro does:**  
**Before** generating `requirements.md`, Kiro **asks clarifying questions in chat** based on your description. The spec is generated **only after** that back-and-forth is complete. So the model doesn’t “guess” from a single prompt; it refines understanding first.

**Why it’s better:**  
- **Fewer “actually, I meant…” loops later:** Ambiguity is reduced before any document is written.  
- **Better first drafts for complex features:** Hard or underspecified ideas get probed (scope, edge cases, constraints) instead of one-shot generation.  
- **Aligns with how Kiro positions itself:** Their blog frames the problem as “AI jumps into code before understanding requirements”; clarification is the fix.  
- **Less context pollution:** Exploratory chat stays in the clarification phase; the final spec is written with a clearer, agreed-upon scope.

**What nSpec does instead:**  
**Single-shot** generation: you submit the modal (or CLI description), and `requirements.md` is produced immediately. You then use the **Refine** bar or CLI `refine` to fix gaps. So you iterate **after** the first draft, not before.

**Source:**  
- [From chat to specs: a deep dive](https://kiro.dev/blog/from-chat-to-specs-deep-dive): “When you provide a project prompt in spec mode, Kiro’s AI doesn’t immediately start coding. Instead, it performs deep analysis to understand your requirements, identifies potential challenges, and creates comprehensive planning documents.”  
- [DEV Community — Stop Chatting, Start Specifying](https://dev.to/kirodotdev/stop-chatting-start-specifying-spec-driven-design-with-kiro-ide-3b3o) [D].  
- [PARITY.md](../PARITY.md) row “Multi-turn clarification before generation” citing [C][D].

---

## 3. Requirements format (EARS notation)

**Where Kiro leads:** Slightly.

**What Kiro does:**  
User stories in **“As a…”** form with acceptance criteria in **EARS** (Easy Approach to Requirements Syntax), e.g.:

- **WHEN** [condition] **THE SYSTEM SHALL** [behavior]  
- **IF** [precondition] **THEN THE SYSTEM SHALL** [behavior]  

Requirements are **numbered** (e.g. Requirement 1, 1.1, 1.2). The word **SHALL** is **mandatory** (not “should” or “may”), which is standard in safety-critical and regulated domains (e.g. Rolls-Royce, Airbus, NASA).

**Why it’s better:**  
- **Testable and unambiguous:** Trigger (WHEN/IF) and mandatory response (THE SYSTEM SHALL) are explicit, which reduces “the system should support X” vagueness.  
- **Industry-aligned:** EARS is used in avionics, automotive, and medical; teams that care about traceability and compliance get a familiar format.  
- **Easier to parse and verify:** Structured patterns make it simpler for tools (or humans) to check coverage and consistency.

**What nSpec does instead:**  
User stories with **Given/When/Then** acceptance criteria and **FR-N** numbering (e.g. FR-1, FR-2). Prose is more natural but less formally constrained than EARS.

**Source:**  
- [EARS Format — Kiro Directory](https://kiro.directory/tips/ears-format): WHEN/IF … THE SYSTEM SHALL.  
- [Alistair Mavin — EARS](https://alistairmavin.com/ears/).  
- [PARITY.md](../PARITY.md) row “Requirements format” citing [D][E].

---

## 4. Design document content (sequence diagrams)

**Where Kiro leads:** Clearly.

**What Kiro does:**  
`design.md` includes **system architecture**, **sequence diagrams**, **data models**, **component responsibilities**, **error handling**, and **testing approach**, generated **with codebase context**. So you get **Mermaid or similar diagram markup** by default, not only prose.

**Why it’s better:**  
- **Visual flow:** Sequence diagrams show interactions over time (e.g. user → API → DB), which is easier to review and discuss than long paragraphs.  
- **Shared language:** Diagrams are standard in design reviews and onboarding.  
- **Less manual work:** You don’t have to add diagrams in a second step; they’re part of the first design output.

**What nSpec does instead:**  
`design.md` has architecture overview, component breakdown, data models, API definitions, tech stack, and error handling, with **workspace context** (e.g. `package.json`, tsconfig, top-level source). **No Mermaid/sequence diagrams in the default prompt** — you can add them via OpenSpec `_prompts/design.md` override.

**Source:**  
- [Kiro Docs — Specs](https://kiro.dev/docs/specs) [A]: design includes sequence diagrams.  
- [PARITY.md](../PARITY.md) row “Design document content”.

---

## 5. Import existing documents (in-chat + diagrams)

**Where Kiro leads:** Slightly.

**What Kiro does:**  
In a **spec chat session**, you can reference a file and ask Kiro to generate a spec from it, e.g. **“#foo-prfaq.md Generate a spec from it”**. Kiro **reads the file** and **produces** requirements, design, and tasks from it. It also accepts **PNG/JPG architecture diagrams** as input for the **Design-First** workflow.

**Why it’s better:**  
- **In-conversation:** You don’t leave chat; you attach a document and give one instruction.  
- **Active transformation:** The tool interprets and restructures the content (e.g. PRD → structured spec), not just copy-paste.  
- **Diagram-as-input:** Existing whiteboard or diagram images can seed the design phase, which helps when “the design already exists on a napkin.”

**What nSpec does instead:**  
**CLI:** `nspec import <name> <stage> <file> [--transform]` copies (and optionally AI-transforms) a file into a spec stage. **Panel:** No dedicated “Import” command; you can drop a file into `.specs/<name>/` and the file watcher refreshes. **Chat:** No “generate a spec from this file” instruction.

**Source:**  
- [Kiro Docs — Best practices](https://kiro.dev/docs/specs/best-practices) [B].  
- [PARITY.md](../PARITY.md) row “Import existing documents”.

---

## 6. Task execution UI (built-in agent)

**Where Kiro leads:** Clearly.

**What Kiro does:**  
- **Per-task Run button:** Executes **that task** via the built-in agent (edits files, runs commands).  
- **Run all tasks:** Runs all incomplete required tasks **in sequence**, with **real-time status** (in-progress / completed) as the agent works.  
- **Validation around execution:** Per Kiro’s blog, “Run all tasks” is backed by **property-based tests (PBTs)**, **dev server checks**, and **LSP diagnostics** so each task’s output is validated before moving on. **Subagents** keep context focused and reduce “context rot” across many tasks.

So task execution is **inside the IDE**, with visibility and control (including Autopilot vs Supervised mode).

**Why it’s better:**  
- **No context switching:** You don’t hand tasks to an external agent or terminal; the same environment that holds the spec runs the work.  
- **Per-task and batch:** You can run one task to verify behavior, or run all and watch progress.  
- **Safety net:** PBTs, dev servers, and LSP reduce the risk that “run all” silently breaks things.  
- **Real-time feedback:** You see which task is running and when it completes.

**What nSpec does instead:**  
**Panel:** “Run all tasks” **echoes task labels to a VS Code terminal** (no built-in agent). **CLI:** `nspec status` and `nspec cascade`; **AGENTS.md** teaches external agents (e.g. Claude Code, Codex) to read and execute tasks. So execution is **delegated** to the user or an external agent; there is **no per-task Run** and **no in-IDE execution status**.

**Source:**  
- [Run all tasks: the feature we refused to ship](https://kiro.dev/blog/run-all-tasks/): PBTs, dev servers, LSP, subagents, real-time visibility.  
- [Kiro Docs — Autopilot](https://kiro.dev/docs/chat/autopilot): Autopilot vs Supervised.  
- [PARITY.md](../PARITY.md) row “Task execution UI” citing [A].

---

## 7. Task completion detection (reconciling with codebase)

**Where Kiro leads:** Per docs; real-world reports vary.

**What Kiro claims:**  
Two mechanisms: (1) Click **“Update tasks”** on `tasks.md` — Kiro **scans the codebase** and **auto-marks tasks complete** if the relevant code already exists. (2) In a spec chat session, ask **“Check which tasks are already complete.”**

**Why that would be better:**  
- **No manual checkbox drudgery** for work already done (e.g. after a merge or manual implementation).  
- **Spec and code stay aligned:** The task list reflects reality instead of drifting.

**Caveat:**  
Some user reports and third-party summaries indicate that **auto-detection of completed work** is not always reliable and that there are requests for “persistent task state and context tracking across sessions.” So the **intent** (reconcile list with codebase) is a clear lead; the **maturity** of that feature may vary.

**What nSpec does instead:**  
**Manual checkbox toggle only.** No codebase scanning. `_progress.json` **persists** checkbox state across **task regeneration** (so regenerating `tasks.md` doesn’t wipe completion). So nSpec wins on “survives regeneration”; it does not try to infer completion from the code.

**Source:**  
- [Kiro Docs — Best practices](https://kiro.dev/docs/specs/best-practices) [B].  
- [PARITY.md](../PARITY.md) row “Task completion detection”.  
- [Kiro GitHub Issue #1961](https://github.com/kirodotdev/Kiro/issues/1961) (e.g. persistent task state / auto-detection).

---

## 8. Diff review per task (supervised mode)

**Where Kiro leads:** Clearly.

**What Kiro does:**  
- **Supervised mode:** The agent **stops after each turn** that contains file edits and **presents changes as diffs**. You **accept or reject** per hunk (or per file). You can accept file-by-file or “accept all” and continue.  
- **Autopilot mode:** Agent runs without per-turn approval; diffs are available **after** execution for review.  
- **Per-file review (0.8):** When multiple files are edited, you can review and **accept/reject per file** in supervised mode.

So you get **visibility and control** over every change the agent makes, with a clear accept/reject workflow.

**Why it’s better:**  
- **Catch bad edits before they land:** You see exactly what will change and can reject or refine.  
- **Granular control:** Per-file (and per-hunk) approval fits strict review policies or risky codebases.  
- **No separate “agent” product:** The same IDE that holds the spec also proposes and applies edits, so the loop is tight.

**What nSpec does instead:**  
**No diff review UI and no built-in agent.** Tasks are executed by the user or by an external agent (e.g. via AGENTS.md). So there is no “proposed change → accept/reject” surface in nSpec itself. With Codex and `vscode.lm` tool-calling, a supervised diff flow is **possible** but **not implemented**.

**Source:**  
- [Kiro Docs — Autopilot](https://kiro.dev/docs/chat/autopilot): Supervised vs Autopilot, per-hunk accept/reject.  
- [Kiro Changelog 0.8](https://kiro.dev/changelog/ide/0-8/): “Per-file review capabilities” in supervised mode.  
- [PARITY.md](../PARITY.md) row “Diff review per task” citing [C].

---

## Summary table

| Area | Kiro’s advantage | Main reason |
|------|------------------|-------------|
| **Creation wizard** | Guided chat (Feature/Bug → description) | Incremental intent capture; single mental mode. |
| **Clarification** | Questions before generating requirements | Fewer ambiguities and “actually I meant” loops; better first drafts. |
| **Requirements format** | EARS (WHEN/IF … THE SYSTEM SHALL) | More testable, unambiguous, and industry-aligned. |
| **Design content** | Sequence diagrams by default | Visual flows in first design output; less manual diagram work. |
| **Import** | In-chat “generate spec from this file” + diagram input | Active transformation in conversation; diagrams as design input. |
| **Task execution** | Per-task Run, Run all, real-time status, PBT/LSP/dev-server checks | Built-in agent; no handoff; validation and visibility. |
| **Task completion** | Update tasks / “check which complete” vs codebase | Aligns task list with existing code (docs claim; user reports vary). |
| **Diff review** | Supervised mode: accept/reject per hunk or per file | Control over every agent edit inside the IDE. |

---

## Sources (for this document)

| # | Source | URL |
|---|--------|-----|
| Kiro Specs | Specs overview | https://kiro.dev/docs/specs |
| Kiro Best practices | Spec workflows, Update tasks, import | https://kiro.dev/docs/specs/best-practices |
| Kiro Autopilot | Supervised vs Autopilot, diff review | https://kiro.dev/docs/chat/autopilot |
| Kiro Run all tasks | PBTs, dev servers, LSP, subagents | https://kiro.dev/blog/run-all-tasks/ |
| Kiro From chat to specs | Clarification, no immediate coding | https://kiro.dev/blog/from-chat-to-specs-deep-dive |
| Kiro Changelog 0.8 | Per-file code review in supervised mode | https://kiro.dev/changelog/ide/0-8/ |
| Kiro Spec types | Feature, Bugfix, Design-first | https://kiro.dev/blog/specs-bugfix-and-design-first/ |
| EARS (Kiro Directory) | WHEN THE SYSTEM SHALL | https://kiro.directory/tips/ears-format |
| PARITY.md | Gap analysis and citations [A]–[F] | ../PARITY.md |
