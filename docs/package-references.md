# Package references

A package keeps what a contributor or agent must know before changing it in `packages/<name>/references/`. These rules apply to contributors and agents.

References hold only context and decisions. Write installation, usage, and public API guidance in [package documentation](package-documentation.md).

## Structure

A package may have `docs/` for user documentation and `references/` for development context. Nothing else.

```text
packages/<name>/
  docs/
  references/
    README.md
    context.md
    concepts/
    decisions/
```

Create a file or folder only when it has content.

- `README.md` is the index. Add it only when there is more than one file.
- `context.md` says what the package is for, where its boundaries are, and which rules a change must keep. Start it with one line that says what the package is. Leave out what the code or a test already shows.
- `concepts/` exists only to split `context.md` when it passes about 800 lines. Move one model or term that spans several changes into `concepts/<topic>.md` and link it from `context.md`.
- `decisions/` holds decisions in volumes.

Specs, plans, investigations, and prototypes do not belong in the package. Keep them outside the repository. When a plan or investigation produces a rule that later changes must keep, record it as a decision.

Keep every file under about 800 lines, so an agent can read it in one go.

## Decisions

Record a decision only when a later change could break it without noticing. When a test holds the rule, name the test instead of restating its cases.

A decision states the rule, not the history. Keep each decision as short and simple as it can be without losing content, with plain words and short sentences. Aim for about 15 lines.

```markdown
## D12. Column widths are stored in percent

Status: Accepted, 2026-11-18

Rule: `colwidth` holds percent of the table width, never pixels.
Why: Pixel widths break when the page size or the editor width changes.
Rejected: Pixels with a scale factor. Rounding drifts after each resize.
```

- The title is the rule, not the topic.
- Rule is one sentence.
- Why is one to three sentences with the technical reason only.
- Rejected has one line per option, only when someone might try it again.
- Name the code it is about, such as the module or the attribute.
- Leave out how the team got there. Keep longer arguments outside the repository.

### Volumes

- `decisions/README.md` is the index with one row per decision: number, title, date, and a link to its heading. It also lists the range each volume holds.
- Each decision is a section of a volume, under its own heading such as `## D12. Title`, followed by the `Status:` line.
- Name a volume after its first decision, in lowercase with three digits, such as `d001.md` or `d041.md`.
- Add a new decision at the end of the latest volume. When that would pass about 800 lines, start the next volume.
- Never rename, split, or reorder a volume, so links to its headings stay valid.
- A decision that replaces another says so in its status line. Reduce the old one to a line that links to the new one. Correct a factual error with a note and keep the original reasons.

## Write every reference as public

References live in a public repository. Leave out:

- Names of people, customers, and partners.
- Business reasons and quotes from Slack or calls.
- Links or IDs into internal tools, such as private repositories, chat, or issue trackers.
- Unreleased plans.

## Reading and maintenance

Before changing a package, read its `references/README.md`, or `context.md` when there is no index. Follow links when their topic applies to the task.

References provide context. They do not override repository instructions or prove current behavior. Check claims against the source and tests, and report conflicts.

Keep chat transcripts, work logs, and changelogs out of references.
