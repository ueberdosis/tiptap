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

## Requirements

If the project maintainer has any additional requirements, you will find them listed here.

- **Document any change in behaviour** - Make sure the `README.md` and any other relevant documentation are kept up-to-date.

- **One pull request per feature** - If you want to do more than one thing, send multiple pull requests.

- **Send coherent history** - Make sure each individual commit in your pull request is meaningful. If you had to make multiple intermediate commits while developing, please [squash them](https://www.git-scm.com/book/en/v2/Git-Tools-Rewriting-History#Changing-Multiple-Commit-Messages) before submitting.

**Happy coding**!
