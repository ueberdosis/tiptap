---
name: create-pr
description: Create a pull request with a clear, concise description that follows the repository's current PR template. Use when asked to open a PR or prepare its title and description.
---

# Create PR

Write for busy developers: make the change and its purpose clear before adding detail.

## Read the current template

- Find and read the repository's applicable PR template every time, including HTML comments, linked guidelines, and contribution instructions. Check the repository root, `.github/`, and `docs/`, including template directories. If several templates exist, choose the one that fits the change.
- Use the template's current sections, order, length limits, and checklist instructions. Do not copy its structure into this skill or reuse a remembered version.
- Prefer the actual current PR template over stale copies of its structure in other guidance; still follow any compatible contribution rules.
- If no local template exists, check the target repository and its shared GitHub defaults. If none exists, use a compact structure suited to the change and say that no template was found.
- Inspect the full diff against the intended base branch and the relevant issue context. Describe the final change, not the sequence of work or abandoned approaches.

## Write the description

Fit the following content into the template's appropriate sections rather than adding a fixed set of headings:

- Start the narrative with a short summary of what changed and why it matters. If the template starts with links or metadata, preserve that order and lead the first explanatory section with the summary.
- Use short sentences, simple English, and concrete behavior. Put deeper technical detail later, only where the template permits it and reviewers need it.
- For a bug fix, include the setup and steps to reproduce the original issue, the expected behavior, the observed behavior before the fix, and how the fix closes that gap. Keep these distinct even when expressed in a compact example. Do not claim to have reproduced an issue unless you did; label unverified steps.
- Include brief notes on the implementation approach: the key decision and how it produces the intended behavior. Mention tradeoffs or consequences only when they affect review or users.
- Consider a few small diagrams or code examples when they explain reproduction, before/after behavior, the approach, or consequences more clearly than prose. Prefer focused snippets or Mermaid diagrams; omit visuals that only repeat the text. Respect the template's length limits.
- Do not add a validation or verification section, command logs, or a list of checks or tests run. You may briefly mention tests added to the codebase and the behavior they cover. This restriction concerns the description; still perform repository-required checks.
- Preserve required checklist items and mark them truthfully. If the template explicitly requires a validation section or execution results, retain its required heading or field but omit the command/test-run report, following the user's preference. Explain that specific conflict to the user outside the PR.

## Link related work

- Include relevant issues and related PRs in the template's link section or the closest existing section. If it has no suitable section, add a small links section only if its guidelines allow it.
- Include any Linear ticket supplied with the request in that section. Use its supplied URL, or resolve its identifier through available context or tools; never invent a workspace URL.
- Use closing keywords only for issues this PR actually resolves. Label other issues, tickets, and PRs as related work or dependencies rather than implying that they will close.
- Do not invent links or issue numbers. If a required link cannot be resolved, ask for the missing information; when no related work is known, follow the template's convention for an empty field.

## Create the PR

- Confirm the intended repository, base branch, and change scope from the task and repository context. Respect whether the user requested a draft or a ready PR.
- When opening a PR is requested, carry it through using the available GitHub tools or `gh`. If only a description is requested, return the draft without publishing it. Commit or push only within the user's authorization and exclude unrelated changes.
- Before publishing, compare the finished description with every template section and instruction. Confirm that claims match the diff, links are accurate, and no placeholders remain.
- With `gh`, write the exact Markdown to a temporary file and use `--body-file` to preserve newlines and literal code.
- Check for an existing PR for the branch before creating one. If creation has an ambiguous result, check whether it succeeded before retrying to avoid duplicates. Report unresolved authentication or permission failures instead of repeatedly retrying.
- Return the PR link and ask the user to review it. Keep execution results and any blockers in the task response, outside the PR description.
