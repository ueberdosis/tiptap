# Versioning and releases with Changesets

- Run `pnpm changeset` to create a new changeset (choose packages + bump type).
- Run `pnpm version` to update versions and changelogs.
- Maintainers publish with the CI workflow; see [Publish configuration](#publish-configuration) below.

* Changelogs must describe **user-facing changes**. Avoid internal noise.

As an AI Agent contributor, you may write changesets directly in the `changesets` directory. Use the following formats:

- **Filename**: `YYYY-MM-DD-<your-change-description>.md` (e.g., `2024-06-01-add-new-rocket-ship-extension.md`)
- **Contents**:

  ```markdown
  ---
  'package-name': patch|minor|major
  ---

  A clear, concise description of the user-facing change. Include any relevant details, migration steps, or links to documentation.

  Additional, optional extra lines below here can provide more context or information about the change, but the first section should be focused on what users need to know.
  ```

## Publish configuration

The publish workflow is driven by an explicit configuration file at `.github/publish-config.json`. This is the authoritative source for which branches are published, their npm dist-tags, and the metadata used in version PRs and Slack notifications.

### File format

```json
{
  "branches": {
    "<branch-name>": {
      "distTag": "<npm-dist-tag>",
      "label": "stable",
      "title": "<version-PR-title>",
      "commit": "<version-PR-commit-message>"
    }
  }
}
```

### Fields

| Field     | Description                                                                                              |
| --------- | -------------------------------------------------------------------------------------------------------- |
| `distTag` | npm dist-tag passed to `pnpm changeset publish --tag`. Example: `latest`, `next`, `v2-latest`.           |
| `label`   | Arbitrary label for Slack announcements (e.g. `"stable"` or `"prerelease"`). Shown in the Slack message. |
| `title`   | Title used for the Changesets version PR created by the CI.                                              |
| `commit`  | Commit message used for the Changesets version PR.                                                       |

### How it works

1. The GitHub Actions trigger in `.github/workflows/publish.yml` lists which branches are allowed to start the workflow.
2. The resolver job reads `.github/publish-config.json` and looks up the current branch by exact name.
3. If the branch is found, the build and release jobs proceed using the configured values.
4. If the branch is **not** found, the workflow exits cleanly without building or publishing. No notification is sent.

A branch must be present in **both** the workflow trigger list and the publish config to produce a release. This provides a two-layer safety check.

### Adding or removing a release branch

To add a new release branch (e.g., `v2`):

1. **Add it to the workflow trigger** in `.github/workflows/publish.yml` under `on.push.branches`.
2. **Add a matching entry** in `.github/publish-config.json` under `branches`, using the exact same branch name.
3. Ensure the branch's npm dist-tag is registered on npm (`npm dist-tag add <package>@<version> <tag>`) if it does not exist yet.
4. If the packages have not been published from this branch before, verify that [trusted publishing](https://docs.npmjs.com/trusted-publishers) is configured for the relevant packages on npm.

To remove a branch from publishing:

1. Remove the entry from `.github/publish-config.json`.
2. Remove the branch from the workflow trigger list (optional but recommended).
