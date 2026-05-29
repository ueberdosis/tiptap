# Versioning and releases with Changesets

- Run `pnpm changeset` to create a new changeset (choose packages + bump type).
- Run `pnpm version` to update versions and changelogs.
- Maintainers publish with `pnpm publish`.

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
