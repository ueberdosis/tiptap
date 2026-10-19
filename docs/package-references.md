# Package references

Keep development context in `packages/<name>/references/`. These rules apply to contributors and agents.

References explain the package's constraints, proposed work, investigations, and reasons behind decisions.
Write installation, usage, and public API guidance in [package documentation](package-documentation.md).

## Structure

Create files and folders only when there is useful content for them. The following layout shows the available categories, not required scaffolding.

```text
references/
  README.md
  context.md
  concepts/
  plans/
  decisions/
  investigations/
  prototypes/
```

Use lowercase, descriptive filenames with hyphens. Date historical records and concrete plans, such as `2026-10-16-block-anchor-plan.md`.
Use stable names for maintained explanations, such as `anchor-model.md`.

## Entry point and package context

Use `references/README.md` as a short index. For each link, explain what the document covers and when to read it.
Mark historical or replaced material in the index so readers can find current guidance first.

Use `context.md` for maintained development context:

- The problem the package solves and its responsibilities.
- Work that belongs outside the package.
- Relationships with other packages and external systems.
- Constraints and rules that changes must preserve.

Link to user documentation for usage details. Keep each explanation in one place.

## Concepts

Use `concepts/` to explain domain terms, models, relationships, and rules that span several changes.
A concept explains how the parts fit together. A plan describes the steps for a particular change.

Distinguish implemented concepts from proposals. Link proposals to the relevant plans and decisions.
Keep explanations of implemented concepts current as the model changes.

## Plans

Use `plans/` for concrete implementation work. Include:

- The problem and intended result.
- Scope and explicit exclusions.
- The proposed approach and small, verifiable steps.
- Risks, dependencies, and open questions.
- Checks that demonstrate the intended behavior.

Keep status current while work is active. On completion, record the actual result, important deviations, and unfinished work.
Move lasting knowledge into the relevant maintained documentation. Keep the plan as a historical record.

## Decisions

Use `decisions/` for choices that future contributors may need to understand or reconsider.
Record the question, alternatives, chosen approach, reasons, and accepted trade-offs.
Keep minor choices in the relevant plan instead of creating a separate decision file.

Preserve the reasons for historical decisions. When a decision is replaced, mark it as superseded and link to its replacement.

## Investigations

Use `investigations/` for bug analysis, technical research, and feasibility checks.
Record the question, observations, evidence, conclusions, and unresolved questions.
Separate hypotheses from verified results. Include reproduction steps, commands, tests, or sources where needed to check the findings.

## Prototypes

Use `prototypes/` for records of experiments. Explain the question, approaches tried, observed results, and limits of the experiment.
Link to prototype code where it lives. State what the experiment proves and what remains unverified.
Record any resulting lasting decision in `decisions/` and link the two documents.

## Status and historical context

Give each reference a short opening that states its purpose and whether it describes current behavior, proposed work, or historical findings.
Plans and proposals must include an explicit status, such as `draft`, `accepted`, `in progress`, `completed`, `abandoned`, or `superseded`.
An accepted proposal is approved direction, not proof of implementation. A completed plan must describe any remaining gaps.

Historical records must include a date and identify the code or environment examined when findings depend on it.
Use a commit, package version, or other precise reference where needed for reproduction.
Correct factual errors without rewriting the original reasons or presenting old results as current verification.

## Reading and maintenance

Before changing a package, read its reference index if one exists. Read linked documents when their stated topic applies to the task.
Agent instructions can link directly to required context with a clear trigger, such as reading the anchor model before changing anchor mapping.

References provide context. They do not grant permission to implement a plan or override repository instructions.
Check claims against the current source and tests before relying on them. Investigate and report conflicts between references and implementation.

Create a document only when it answers a useful future question. Keep one topic per file and link related documents.
Record implementation history through completed plans and decisions. Add a separate retrospective only when a major change needs a broader explanation.
Keep chat transcripts, daily work logs, and duplicate changelogs out of references.
