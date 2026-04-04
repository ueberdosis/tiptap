# Contributing

Contributions are **welcome** and will be fully **credited**.

Please read and understand the [contribution guide](https://www.tiptap.dev/overview/contributing/) before creating an issue or pull request.

## Why this process exists

We want to reduce one-off drive-by pull requests and keep better control over issue ownership.

This helps us:

- avoid multiple contributors working on the same issue in parallel
- give contributors clear maintainer feedback before work starts
- spend review time on changes that align with the roadmap and project standards

## Etiquette

This project is open source, and as such, the maintainers give their free time to build and maintain the source code held within. They make the code freely available in the hope that it will be of use to other developers. It would be extremely unfair for them to suffer abuse or anger for their hard work.

Please be considerate towards maintainers when raising issues or presenting pull requests. Let's show the world that developers are civilized and selfless people.

It's the duty of the maintainer to ensure that all submissions to the project are of sufficient quality to benefit the project. Many developers have different skillsets, strengths, and weaknesses. Respect the maintainer's decision, and do not be upset or abusive if your submission is not used.

## Viability

When requesting or submitting new features, first consider whether it might be useful to others. Open source projects are used by many developers, who may have entirely different needs to your own. Think about whether or not your feature is likely to be used by other users of the project.

## Required contribution flow

Every pull request must be backed by a valid issue and an explicit maintainer assignment or go-ahead.

The expected flow is:

1. You want to work on an existing issue, or you create a new issue for the bug or feature first.
2. You comment on that issue and ask to be assigned.
3. A maintainer assigns you to the issue, or explicitly tells you to proceed.
4. You make the changes, add a Changeset if needed, and make sure quality and testing standards are met.
5. You open a pull request using `.github/pull_request_template.md` and link the issue with an auto-closing keyword such as `Closes #123`.
6. Once the pull request is merged, GitHub closes the linked issue automatically.

## What happens if you skip the flow

- Pull requests without a linked issue will be closed.
- If you want to fix something that is not an issue yet, create the issue first and wait for maintainer confirmation before opening a pull request.
- Before opening a pull request, ask on the issue to be assigned and wait for maintainer approval.
- We only accept contributions that are tied to a valid issue and have a contributor assigned or explicitly approved by a maintainer.
- Pull requests that skip assignment or prior maintainer approval may be closed.

## Before filing an issue

- Attempt to replicate the problem, to ensure that it wasn't a coincidental incident. Create a CodeSandbox to reproduce the issue. Use one of these templates to get started:
  - [JavaScript template](https://codesandbox.io/s/tiptap-js-fv1lyo)
  - [React template](https://codesandbox.io/s/tiptap-react-qidlsv)
  - [Vue 2 template](https://codesandbox.io/s/tiptap-vue-2-25nq3g)
  - [Vue 3 template](https://codesandbox.io/p/sandbox/tiptap-vue-3-ci7q9h)
- Check to make sure your feature suggestion isn't already present within the project.
- Check the pull requests tab to ensure that the bug doesn't have a fix in progress.
- Check the pull requests tab to ensure that the feature isn't already in progress.

## Before starting work on an issue

- If possible, comment on the issue early to let maintainers know you are interested in working on it.
- Before opening a pull request, you must have asked to be assigned and received maintainer approval.
- If the work is no longer needed, already in progress, or out of scope, respect that decision before starting implementation.

## Before opening a pull request

- Make sure the linked issue exists and that you were assigned or explicitly approved to work on it.
- Check the codebase to ensure that your feature doesn't already exist.
- Check existing pull requests to ensure that another person hasn't already submitted the feature or fix.
- Use `.github/pull_request_template.md` when opening the pull request.
- Link the original issue with an auto-closing keyword such as `Closes #123`.
- Follow the one pull request per feature rule.

## Quality standards before submitting

- Run the tests and linter before committing your changes.
- Add tests where applicable.
- If you are making changes to one of the packages, add a Changeset when the change is user-facing.
- Make sure your changes do not break the library.
- Document any change in behaviour in `README.md` and any other relevant documentation.

## Changesets

[Changesets](https://github.com/changesets/changesets) are how this repository versions packages and generates changelog entries for releases.

Create a Changeset with `pnpm changeset` when your pull request includes a user-facing change, for example:

- bug fixes users will notice
- new features
- API changes
- behaviour changes that affect consumers

Usually you do **not** need a Changeset for:

- tests only
- refactors with no user-facing effect
- CI or tooling only changes
- docs only changes

When you write a Changeset:

- write it for users, not maintainers
- describe the visible outcome, not internal implementation details
- keep it short and clear

Good examples:

- `Fix pasted content losing paragraph spacing in Markdown output.`
- `Add support for configuring suggestion item filtering in React integrations.`

Poor examples:

- `Refactor parser internals.`
- `Update tests.`
- `Clean up extension implementation.`

## Commits and pull request titles

Commits should follow [Conventional Commits](https://www.conventionalcommits.org/) because this repository uses `commitlint` with the conventional config.

Use commit messages such as:

- `fix: preserve trailing whitespace in markdown serializer`
- `feat: add support for configurable suggestion filtering`
- `docs: clarify changeset requirements`

Additional rules:

- Keep commits focused and meaningful.
- Avoid noisy work-in-progress commit history in submitted pull requests.
- Squash intermediate commits before opening your pull request when needed.
- Name pull requests clearly and consistently. A good default is to use the same style as the final conventional commit summary.

## Licensing

Please respect open source licenses when contributing to this project.

- Make sure any new dependency, copied code, asset, or external source you introduce is compatible with this repository's license and distribution model.
- If a dependency does not allow MIT-compatible usage, redistribution, or commercial use, do not add it to the project.
- If you are unsure whether a license is compatible, ask a maintainer before proceeding.
- When in doubt, prefer a clearly licensed and compatible alternative.

## AI usage

We use AI in parts of our workflow, but we do not treat AI output as self-approving or self-merging.

Maintainers may use AI for:

- code generation and implementation support
- code review support
- automated communication drafts

However, all maintainers remain responsible for the final outcome:

- everything must go through human review
- we do not send, merge, or publish AI-generated output without manually checking it first
- maintainers are accountable for the correctness, tone, and quality of what is submitted

Contributor use of AI is allowed, including AI-assisted issues and pull requests, with the following expectations:

- a human must define the problem, intent, and specification
- do not fully automate contribution work end to end without meaningful human oversight
- contributors must understand, review, and stand behind the final issue, discussion, or pull request they submit

We do not want maintainers or contributors to fully rely on AI for development or discussion:

- do not turn the repository into fully automated "vibe code" contributions
- do not let AI agents conduct the entire collaboration loop without human involvement
- this repository should not become AI bots talking to each other

## Security

If you discover a security vulnerability, please refer to our [Security Policy](SECURITY.md) for reporting instructions.

## Create a new demo

To make it easier to add new demos to the demos app we provide a small helper script via `pnpm run make:demo` that scaffolds a new demo directory from our default template.

**What it does**

- Prompts for a demo name and category.
- Validates the category is one of: `Dev`, `Examples`, `Extensions`, `Experiments`, `Marks`, `Nodes`.
- Copies the template `demos/src/Examples/Default` to `demos/src/<Category>/<Demo_Name>`.

**How to use**

From the repository root run one of the following:

```bash
pnpm run make:demo
```

or:

```bash
sh ./scripts/make-demo.sh
```

Then follow the interactive prompts for the demo name and category.

**Notes and follow-up steps**

- The script only copies the template. After the scaffold is created, update the demo's files (title, description, imports) to reflect your example.
- Make sure to review the generated demo in `demos/` and run the demos app (`pnpm dev`) to verify it appears and works as expected.
- If your demo changes package behaviour or exposes user-facing changes, follow the normal rule and add a Changeset and tests as needed.
- If you don't want your demo to be included in the Git repository, use the `Dev` category. Demos in this category are ignored by git via `.gitignore`.

## Publishing new packages

Packages are published by the repository's automated release workflow using [Changesets](https://github.com/changesets/changesets) and trusted publishing.

- Do not publish packages manually.
- When a package should be released, include a correct Changeset in your pull request.
- The publish workflow is responsible for turning merged Changesets into version bumps, changelog entries, and published packages.
- Make sure the Changeset clearly describes the user-facing change, because that text is used in the release notes and changelog.

## Additional requirements

- **One pull request per feature** - If you want to do more than one thing, send multiple pull requests.
- **Send coherent history** - Make sure each individual commit in your pull request is meaningful. If you had to make multiple intermediate commits while developing, please [squash them](https://www.git-scm.com/book/en/v2/Git-Tools-Rewriting-History#Changing-Multiple-Commit-Messages) before submitting.

**Happy coding**!
