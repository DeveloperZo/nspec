# Three Paths to Kiro Parity — Ranked by User Ease of Use

Three alternative milestone plans that each deliver **the same parity outcomes** with Kiro. Paths are **ranked by user ease of use**: Path 1 improves day-to-day ease soonest; Path 3 delivers the same capabilities but with the “easiest” UX coming last.

---

## Target deliverables (same for all paths)

By the end of any path, nSpec will have closed the Kiro gaps with these deliverables:

| # | Deliverable | Parity with Kiro |
|---|-------------|------------------|
| D1 | **Guided creation flow** | Wizard-like: type (Feature/Bug) → description in a conversational or stepped flow (panel or chat), not only a single modal. |
| D2 | **Multi-turn clarification** | Before generating requirements, the system asks clarifying questions (panel, chat, or CLI); generation runs after the user confirms or answers. |
| D3 | **EARS-style requirements option** | Optional format: WHEN/IF … THE SYSTEM SHALL, numbered requirements; configurable per spec or workspace. |
| D4 | **Sequence diagrams in design** | design.md includes Mermaid (or equivalent) sequence diagrams by default or via a toggle/template. |
| D5 | **Import from file/diagram in UI** | Panel or chat: “generate spec from this file” or “use this image as design input”; not only CLI import. |
| D6 | **Per-task Run + Run all with status** | Per-task “Run” and “Run all tasks” that execute via an agent (or vscode.lm tool-calling), with in-UI status (e.g. in-progress / completed). |
| D7 | **Task completion detection** | “Update tasks” or equivalent that scans the codebase and auto-marks tasks complete where evidence exists; or chat “check which tasks are complete.” |
| D8 | **Diff review (supervised)** | For agent-proposed edits: show diff in editor, accept/reject per hunk or per file before applying. |

All three paths ship D1–D8; only the **order** of milestones differs.

---

## Ranking criterion: user ease of use

- **Ease of use** = how quickly and how much the **daily spec author** feels the product get easier: less friction to start a spec, to get a good first draft, to import existing docs, to run and review task execution.
- **Path 1 (highest ease):** Front-load creation, clarification, and import so “starting and shaping a spec” gets easier first; execution and diff come later.
- **Path 2 (medium ease):** Mix quick wins (import, clarification) with one big execution milestone, then finish with wizard + EARS + diagrams.
- **Path 3 (lowest ease):** Back-load UX: execution, diff, and completion detection first; guided creation, clarification, EARS, diagrams, and import last. Full “ease” only at the end.

---

## Path 1 — Ease-first (highest user ease of use)

**Idea:** Improve the “create and refine spec” experience first. Users get a gentler creation flow, clarification, and import early; execution and diff follow.

| Milestone | Focus | Deliverables touched | Why this order |
|-----------|--------|----------------------|----------------|
| **1.1 Guided creation + clarification** | Wizard-like creation and multi-turn clarification before requirements. | D1, D2 | Users feel “the tool asks me what I need” and “I can clarify before it writes” — biggest ease win for starting a spec. |
| **1.2 Import and diagrams** | Import from file/image in panel or chat; sequence diagrams in design. | D4, D5 | “I can bring in a doc or a diagram” and “design shows flows” — less manual work and fewer steps. |
| **1.3 EARS option** | Optional EARS-style requirements format (WHEN/IF … SHALL). | D3 | Spec quality and compliance without changing the creation flow. |
| **1.4 Task execution + diff + completion** | Per-task Run, Run all, status; diff review; task completion detection. | D6, D7, D8 | Execution and control; builds on already-easy creation. |

**Ease profile:** Ease of use rises quickly (creation and clarification in 1.1), stays high through 1.2–1.3, then gets full parity with 1.4.

---

## Path 2 — Balanced (medium user ease of use)

**Idea:** One early “quick win” milestone, then the big execution milestone, then the rest of the UX polish.

| Milestone | Focus | Deliverables touched | Why this order |
|-----------|--------|----------------------|----------------|
| **2.1 Quick wins: import + clarification** | Import from file/diagram in UI; multi-turn clarification before requirements. | D2, D5 | Fast visible improvements: “generate from this file” and “it asks me questions first.” |
| **2.2 Task execution + diff + completion** | Per-task Run, Run all, status; diff review; task completion detection. | D6, D7, D8 | Closes the largest functional gap with Kiro (built-in execution + control). |
| **2.3 Guided creation + EARS + diagrams** | Wizard-like creation; EARS option; sequence diagrams in design. | D1, D3, D4 | Completes parity: easier start (wizard), better requirements (EARS), better design (diagrams). |

**Ease profile:** Early ease from 2.1; then a period focused on execution (2.2); then full ease with 2.3.

---

## Path 3 — Execution-first (lowest user ease of use)

**Idea:** Do the hardest and most “backend” work first: execution, diff, completion. Guided creation, clarification, format, and import come last.

| Milestone | Focus | Deliverables touched | Why this order |
|-----------|--------|----------------------|----------------|
| **3.1 Task execution + diff + completion** | Per-task Run, Run all, status; diff review; task completion detection. | D6, D7, D8 | Parity on “the agent runs tasks and I approve changes” first; creation flow unchanged. |
| **3.2 Import + diagrams + EARS** | Import from file/diagram in UI; sequence diagrams in design; EARS option. | D3, D4, D5 | Better content: import, diagrams, requirements format — still no wizard or clarification. |
| **3.3 Guided creation + clarification** | Wizard-like creation; multi-turn clarification before requirements. | D1, D2 | Last: “easiest” start experience (wizard + clarification) so full ease of use arrives at the end. |

**Ease profile:** Ease of use improves mainly in 3.2 (import/diagrams) and only fully with 3.3; creation stays as today until the final milestone.

---

## Side-by-side

| Deliverable | Path 1 (ease-first) | Path 2 (balanced) | Path 3 (execution-first) |
|-------------|---------------------|-------------------|--------------------------|
| D1 Guided creation | 1.1 | 2.3 | 3.3 |
| D2 Clarification | 1.1 | 2.1 | 3.3 |
| D3 EARS option | 1.3 | 2.3 | 3.2 |
| D4 Sequence diagrams | 1.2 | 2.3 | 3.2 |
| D5 Import in UI | 1.2 | 2.1 | 3.2 |
| D6 Run + Run all + status | 1.4 | 2.2 | 3.1 |
| D7 Task completion detection | 1.4 | 2.2 | 3.1 |
| D8 Diff review | 1.4 | 2.2 | 3.1 |

---

## Recommendation

- **Choose Path 1** if the goal is to maximize **user ease of use** on the way to parity: creation and clarification improve first, then import/diagrams, then execution.
- **Choose Path 2** if you want a **balance**: early import + clarification, then one big execution milestone, then wizard + EARS + diagrams.
- **Choose Path 3** if **execution parity** must ship first (e.g. “run tasks in IDE” is the main ask) and you accept that the “easiest” creation experience comes last.

All three paths end with the **same deliverables** (D1–D8); only the **order** and thus the **ease-of-use curve** differ.
