---
name: create-issue
description: MUST be used whenever an agent drafts or creates an issue in this repository. Use for bug reports, Tiptap Pro bug reports, and documentation feedback. Keeps issues short, plain, and based on the current issue template.
---

# Create issue

A maintainer must understand the issue in one read. Target one screen, not a design document. Describe the problem, not the fix.

## Before writing

- Read the current templates in `.github/ISSUE_TEMPLATE/`. Never rely on remembered fields.
- Choose the matching template: `bug_report.yml`, `bug_report_pro.yml`, or `documentation.yml`.
- Feature requests belong in Discussions, not issues. Read `config.yml` and send the user there instead.
- Search for an existing issue with `gh issue list --search "<keywords>"`. If you find the same problem, link it instead of opening a duplicate.
- Reproduce the problem when you can. Only state what you verified.

## Writing rules

- Use the template fields, in the template order. Do not add new sections or headings.
- Title: one short phrase naming the broken behavior. No package prefix unless needed, no em dash chains, no long clauses. Aim for 80 characters or less.
- What happened: one to three short sentences. Say what the user sees, and when it happens.
- Expected behavior: one sentence.
- Describe the symptom, not the solution. Never include a suggested fix, patch, or implementation plan unless a maintainer asked for it.
- Root cause: include it only if you truly know it. Put it in Additional Context and keep it to two short sentences. If it needs a step chain, a diagram, or internal names to explain, leave it out.
- Code examples: only the smallest snippet that reproduces the bug, ten lines or less. No complete apps, no long logs.
- Inline code: only package names, API names, and exact error text. Do not wrap ordinary words in backticks.
- Plain English, short sentences. Run the `unslop` checks before publishing.
- Leave optional fields empty when you have nothing short to add.

## Length budget

| Part | Limit |
| --- | --- |
| Title | 80 characters |
| What happened | 3 sentences |
| Expected behavior | 1 sentence |
| Root cause | 2 sentences |
| Reproduction | 10 lines |
| Whole issue | One screen |

If a draft is over budget, cut detail. Do not compress by removing articles or verbs.

## Example

Too long, and it explains the internals:

> In a collaborative editor, the first keystroke typed into any heading throws from `mapPositionMigration → getPositionContent`, which kills the whole dispatch inside `EditorState.applyInner`. The TOC plugin's `appendTransaction` assigns a `data-toc-id` to any heading that has text but no id, so a freshly created heading has no id. At that moment PM's heading contains the typed character but Yjs's heading is still childless, producing an index mismatch.

Short, and it describes the problem:

> **What happened?** With Collaboration and TableOfContents enabled, typing into a heading throws `Error: Position tracking requires synchronized editor text`. The character never appears, and later keystrokes keep failing. The table of contents plugin adds a heading id before Yjs has seen the new text.
>
> **Expected behavior?** Typing into a heading works.

The second version drops the call stack, the plugin internals, the proposed patch, and the version archaeology. A maintainer can still investigate it.

## Publish

- Show the draft to the user first. Wait for approval before creating the issue.
- Create it with `gh issue create`, writing the Markdown body to a temp file and using `--body-file`. Apply the labels from the template metadata.
- If the user only asked for a draft, return the draft without publishing it.
- Return the issue link and ask the user to review it.
