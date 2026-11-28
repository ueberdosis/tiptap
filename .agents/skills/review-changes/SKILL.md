---
name: review-changes
description: Review uncommitted, staged, unstaged, or latest-turn changes for correctness, maintainability, bugs, documentation quality, and release readiness. Return a score out of 100, a verdict, and concrete fixes.
---

# Review changes

Run a read-only review. Keep source files and the Git index intact.

## Scope and reviewer

Usage: `/review-changes [uncommitted|staged|unstaged|turn]`

Read the repository instructions and any available task brief. Use the supplied mode, defaulting to `uncommitted` when omitted. Accept `uncommited` as an alias. For an unknown mode, show the usage and stop. Apply any explicit file scope within the selected mode.

| Mode          | Changes to review                                                                                                                                                                                                                                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uncommitted` | Staged changes (`git diff --cached`), unstaged changes (`git diff`), and new files (`git ls-files --others --exclude-standard`). Review the combined working tree. Inspect staged content separately when unstaged edits would hide what goes into a commit. Say which version a finding applies to.                        |
| `staged`      | The index changes from `git diff --cached`. Read affected tracked files from the index when their working copies differ. Use the staged snapshot for checks, or report why a check could not be run against it.                                                                                                             |
| `unstaged`    | Changes since the index (`git diff`) and new files (`git ls-files --others --exclude-standard`). Use staged code as context and report findings on the unstaged changes.                                                                                                                                                    |
| `turn`        | Changes made by the agent in the most recent completed turn that changed files in this checkout. Identify its edits from patches, tool output, or before-and-after snapshots. Isolate its hunks from earlier or later edits, even within the same file. Include commits only when the turn's history ties them to its work. |

If `turn` can only be reconstructed in part, review the confirmed edits and report the gap. If no edits can be attributed reliably, report `Needs verification` with score `N/A` and ask for the turn's diff or a before-and-after reference. For a confirmed empty scope, report `No changes to review` with score `N/A`.

Prefer one independent subagent when delegation is available and allowed. Give it the repository path, selected scope, available task brief, and these instructions. For `turn`, also pass the attributed diff or the evidence needed to reconstruct it. If you are already the assigned reviewer, or delegation is unavailable, unsuitable, or declined, review directly.

## Review

Read the affected entry points, callers, and tests. Judge findings against the intended behavior and repository conventions. Report issues introduced or exposed by the changes.

| Area                            | What to check                                                                                                                                                                                                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Correctness and maintainability | Behavior matches the task, contracts still hold for callers, and the implementation follows project conventions. Flag specific duplication, tangled control flow, or unnecessary complexity with a concrete maintenance cost.                                                                                                   |
| Bugs and verification           | Trace plausible regressions and relevant failure cases, including existing data, boundary values, and partial failures where they matter. Run the smallest useful existing test, type check, or build. Use a short local check for a specific suspected bug if it adds evidence. Keep temporary artifacts outside the checkout. |
| Documentation                   | Apply `/unslop` to changed docs, JSDoc, and comments as a review pass. If slash commands are unavailable, load the `unslop` skill directly. Verify claims against the code. Flag stale or missing contract details, filler, and comments that restate the code. Suggest a short, accurate rewrite or deletion in the report.    |
| Release readiness               | Check relevant CI and release requirements, including compatibility, migrations, config, packaging, and release notes where the project needs them. Flag missing files required by the change.                                                                                                                                  |

For each finding, confirm a trigger and consequence or cite the relevant project rule. Distinguish failures observed in a check from issues inferred from code. Report checks that passed, failed, or could not run. Describe any gap that affects release confidence.

## Report

Score each area up to 25 points. Start at 25 per area and deduct 5 for a minor actionable issue, 10 for a material issue or verification gap, or 25 for a critical issue. Count each issue once in the best-fitting area. Floor each area at zero and add the four scores. A skipped check only affects the score when it leaves a relevant gap.

Open with the score as `N/100` and one verdict:

- **Ready to release** when there are no required fixes and the available evidence supports release.
- **Changes required** when a confirmed issue must be fixed before release, regardless of score.
- **Needs verification** when no confirmed blocker exists and a missing check or evidence gap prevents a release decision.

List required fixes and checks in priority order. For each, include `path:line` when available, the concrete impact, and the smallest fix or check. Say when no fixes are required. Keep optional improvements brief and list the checks actually run.
