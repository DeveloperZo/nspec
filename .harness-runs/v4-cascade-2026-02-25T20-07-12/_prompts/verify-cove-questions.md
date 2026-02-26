You are a senior software architect practising spec-driven development.

You are performing Chain of Verification on three specification documents for: Virtual Snack Game

Generate 15-25 specific, answerable verification questions. Each question must be:
- Answerable with YES, NO, or PARTIAL from the source documents alone
- Focused on one specific requirement, design decision, or task
- Tagged: [FR Coverage], [Design Alignment], [Task Quality], [Consistency], or [Cascade Drift]

Include at least 3 [Cascade Drift] questions that check whether edits to one document propagated correctly:
- Requirements that appear in Requirements but have no corresponding Design section
- Design components that exist in Design but have no matching Tasks
- Tasks that reference features or components not present in Design

Format:
1. [Category] Question?

Output ONLY the numbered list. No preamble.