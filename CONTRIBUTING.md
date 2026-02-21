# Contributing

Contributions are **welcome** and will be fully **credited**.

Please read and understand the [contribution guide](https://www.tiptap.dev/overview/contributing/) before creating an issue or pull request.

## Etiquette

This project is open source, and as such, the maintainers give their free time to build and maintain the source code
held within. They make the code freely available in the hope that it will be of use to other developers. It would be
extremely unfair for them to suffer abuse or anger for their hard work.

Please be considerate towards maintainers when raising issues or presenting pull requests. Let's show the
world that developers are civilized and selfless people.

It's the duty of the maintainer to ensure that all submissions to the project are of sufficient
quality to benefit the project. Many developers have different skillsets, strengths, and weaknesses. Respect the maintainer's decision, and do not be upset or abusive if your submission is not used.

## Security

If you discover a security vulnerability, please refer to our [Security Policy](SECURITY.md) for reporting instructions.

## Viability

When requesting or submitting new features, first consider whether it might be useful to others. Open
source projects are used by many developers, who may have entirely different needs to your own. Think about
whether or not your feature is likely to be used by other users of the project.

## Procedure

Before filing an issue:

- Attempt to replicate the problem, to ensure that it wasn't a coincidental incident. Create a CodeSandbox to reproduce the issue. Use one of these templates to get started:
  - [JavaScript template](https://codesandbox.io/s/tiptap-js-fv1lyo)
  - [React template](https://codesandbox.io/s/tiptap-react-qidlsv)
  - [Vue 2 template](https://codesandbox.io/s/tiptap-vue-2-25nq3g)
  - [Vue 3 template](https://codesandbox.io/p/sandbox/tiptap-vue-3-ci7q9h)
- Check to make sure your feature suggestion isn't already present within the project.
- Check the pull requests tab to ensure that the bug doesn't have a fix in progress.
- Check the pull requests tab to ensure that the feature isn't already in progress.

Before submitting a pull request:

- Check the codebase to ensure that your feature doesn't already exist.
- Check the pull requests to ensure that another person hasn't already submitted the feature or fix.

Branch targets: Pull requests should generally be opened against the `develop` branch. The only exception is a hotfix that needs to be applied immediately to `main`; in that case create the PR against `main`. After `main` has been updated (for example via a release), any commits merged into `main` must be merged back into `develop` to keep branches in sync.

Before committing:

- Make sure to run the tests and linter before committing your changes.
- If you are making changes to one of the packages, make sure to **always** include a [changeset](https://github.com/changesets/changesets) in your PR describing **what changed** with a **description** of the change. Those are responsible for changelog creation

## Create a new demo

To make it easier to add new demos to the demos app we provide a small helper script via `pnpm run make:demo` that scaffolds a new demo directory from our default template.

**What it does**

- Prompts for a demo name and category.
- Validates the category is one of: `Dev`, `Examples`, `Extensions`, `Experiments`, `Marks`, `Nodes`.
- Copies the template `demos/src/Examples/Default` to `demos/src/<Category>/<Demo_Name>`.

**How to use**

- From the repository root run:
- If the script is executable:
- Or with bash directly:
- Follow the interactive prompts for the demo name and category.

**Notes and follow-up steps**

- The script only copies the template. After the scaffold is created, update the demo's files (title, description, imports) to reflect your example.
- Make sure to review the generated demo in `demos/` and run the demos app (`pnpm dev`) to verify it appears and works as expected.
- If your demo changes package behaviour or exposes user-facing changes, follow the normal rule and add a changeset and tests as needed.
- If you don't want your demo to be included in the Git repository, use the `Dev` category. Demos in this category are ignored by git via `.gitignore`.

## Publishing New Packages

When adding a new package to the repository that does not yet exist on NPM, additional setup is required before the automated publish CI can release it:

1. **Manual initial publish** - The package must be published manually to NPM for the first time using normal user authentication. This is required because trusted publishing can only be configured for packages that already exist on the registry.
   - For a single package, run `pnpm run build && pnpm publish` from the package directory (e.g., `packages/extension-audio/`).
   - Alternatively, run `pnpm run publish` from the root directory to publish all packages.
2. **Configure trusted publishing** - After the initial publish, set up [NPM trusted publishing](https://docs.npmjs.com/trusted-publishers) (also known as provenance) for the package on NPM. This allows the GitHub Actions workflow to publish subsequent versions automatically.

Without this setup, the publish CI will fail when attempting to release a new package.

## Requirements

If the project maintainer has any additional requirements, you will find them listed here.

- **Document any change in behaviour** - Make sure the `README.md` and any other relevant documentation are kept up-to-date.

- **One pull request per feature** - If you want to do more than one thing, send multiple pull requests.

- **Send coherent history** - Make sure each individual commit in your pull request is meaningful. If you had to make multiple intermediate commits while developing, please [squash them](https://www.git-scm.com/book/en/v2/Git-Tools-Rewriting-History#Changing-Multiple-Commit-Messages) before submitting.

**Happy coding**!

## Releases

This repository uses Changesets to manage releases. Contributors should add a changeset for any package-level change they expect to be published; these changesets are collected and drive our release process.

Only pull requests that include a changeset will be considered for a release. If a pull request does not contain a changeset, it will not trigger a package release and therefore will not be included in the next release cycle.

When changesets are merged into the default branch, the Changesets tooling creates a Release PR that contains the proposed version bumps and compiled changelog entries for all affected packages. Maintainers should review this Release PR to confirm that the version bumps and changelog entries are accurate before merging.

Because Changesets does not create GitHub release tags or individual GitHub Releases automatically in our workflow, we create release tags manually from the merge commit of the Release PR. After creating the tag, maintainers must create a GitHub Release from that tag and copy the changelog content from the Release PR into the GitHub Release description. This manual copy-and-paste step is required because Changesets does not currently support automatic per-tag GitHub Releases for our setup.

When assembling the GitHub Release description, please clean up the changelog so it includes only packages that have meaningful changes; exclude packages that only contain dependency bump noise where possible. Note that publishing to NPM is handled by our release automation and will occur even if a GitHub Release is not created—creating the GitHub Release is for visibility and recorded release notes only.

If you have questions about adding changesets or about any part of the release process, please ask in the pull request or reach out to a maintainer.

### Release procedure (step-by-step)

1. Create one or more changesets for the package changes you want published. Use the `changeset` CLI or the web workflow to generate a changeset file that describes the change and the desired version bump.
2. Open a pull request with your changes and include the changeset file(s) in the PR. Ensure tests and linters pass before requesting review.
3. After the PR is reviewed and approved, merge it into the default branch. Only PRs that include changesets will be considered for release.
4. When changesets are merged into the default branch, the Changesets tooling will create a Release PR that aggregates proposed version bumps and compiled changelog entries for all affected packages.
5. Review the Release PR carefully. Verify that the version bumps, changelog entries, and affected packages are correct. Clean up any noisy dependency-only bumps from the changelog if appropriate.
6. Merge the Release PR once you are satisfied with the bumps and changelog content.
7. Create a release tag manually from the merge commit of the Release PR. Use a tag name that follows the repository's tagging convention (for example `v1.2.3`).
8. Create a GitHub Release from the tag you just created. Copy the changelog content from the Release PR into the GitHub Release description (this is a manual copy-and-paste step required by our workflow).
9. Verify that the NPM publish automation has run and that packages have been published. Note that NPM publishing is performed by our release automation and usually occurs even if a GitHub Release is not created.
10. Announce the release as appropriate and close any related issues.
11. After the release, ensure that any commits merged into `main` (for example from a release or hotfix) are merged back into `develop` so the development branch remains up-to-date.
