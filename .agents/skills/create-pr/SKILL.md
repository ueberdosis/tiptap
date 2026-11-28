---
name: create-pr
description: Prepare a short PR description from the linked context, actual diff, and available verification results. Use the agent template and follow the repository's rules for AI-assisted writing and author sign-off. Surface missing intent or unclear expected behavior for the author to confirm.
---

# Write a pull request

Read the [agent template](../../../.github/PULL_REQUEST_TEMPLATE/agent.md) and use its headings and order. For an update, read the current description and reviews. Keep useful author notes and public links.

Follow `AGENTS.md` and `CONTRIBUTING.md` for repository checks, release requirements, and reviewer assignment.

Use the [examples](references/examples.md) when you need to see how much detail fits the change or how to report limited evidence.

## Understand the change

1. Confirm the base and head. Read the actual diff, linked context, and relevant tests and docs. Include any local changes meant for the PR.
2. Find who is affected and why the change matters. Ask the author to confirm missing intent or unclear expected behavior. Label any open question in the draft and avoid guessing.
3. Describe a concrete scenario and what should happen after merge. For an internal change, state what must hold or what outcome can be measured. Include compatibility or migration details that affect the merge decision.

## Write for a quick read

Use a short title in sentence case. Lead with concrete impact. Use one bullet per point in each section. Use short sentences and simple words. Keep details that affect the merge decision. Link supporting context once. Remove empty optional sections and unused prompts.

Put AI disclosure in a separate closing paragraph. For an agent-created PR, keep the template's notice and say what AI helped with.

In References, link only publicly accessible issues, PRs, Discussions, and other sources. Keep internal links, IDs, titles, quotes, and private details out of the title and body, even when supplied as context. This includes Slack, Linear, HubSpot, Notion, and similar tools.

Confirm the assigned public issue before opening, unless the change is a trivial fix. Use `Fixes` or `Closes` only for issues the PR resolves. For a backport, link the original PR and name the target branch. If a critical bug or security fix also affects the current stable release, flag the backport in References. Follow the maintenance rules.

## Point reviewers to decisions

Start every Review bullet with a linked file path and verified line range. Pin the link to the exact head commit, or to the base commit for removed code. Use the smallest range that shows the decision. After the link, say what a human needs to decide and what depends on that decision.

- For security, flag changes to access, permissions, or trust. Say who can do what and which rule a maintainer needs to confirm.
- For performance, flag frequently run code or work that grows with document size, users, or traffic. Name the workload and the tradeoff. Link measurements when available.
- For API or implementation choices, flag decisions about public behavior, defaults, compatibility, or how the change fits the codebase. Say what a maintainer would commit to.

Put the highest-impact item first. Aim for one to three starting points and keep every material decision visible. Use the [review policy](../../../CONTRIBUTING.md#reviewing-and-merging-the-pr) to decide when a second human is needed. Omit Review when no point needs human judgment.

## Report checks and get author sign-off

In Verification, say what you checked and what you saw. Link the smallest useful demo, repro, or measurement. Report gaps that could affect the merge decision. Attribute results from other people or CI. Never invent a result, link, or line range. Refresh line links and affected verification when the diff changes.

Name the docs you updated or explain why none are needed. Include the required changeset for package changes. A public API break needs migration notes and a major changeset.

The human author checks the evidence, resolves findings, and owns the merge decision. Get explicit sign-off when the author or repository requires it. Do not claim approval the author has not given.

## Open or update the PR

When authorized, check for an existing PR before creating one. Use the GitHub CLI with `--body-file`. Use a draft to discuss open tradeoffs or while waiting for required author sign-off. Check that the published body and head match the draft, and return the PR link.

Start with an independent agent review. If GitHub has not queued one for a ready PR, request Copilot with `gh pr create --reviewer @copilot` or `gh pr edit <number> --add-reviewer @copilot`. Keep independent findings in the review. Flag a missing review to the author and refresh the review after material changes.
