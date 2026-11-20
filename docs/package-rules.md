# Package rules

A package holds its code, its tests, its user documentation in `docs/`, and an optional short `AGENTS.md` with the rules a change must keep. Nothing else for development context goes into the repository. Specs, plans, investigations, and long reasons stay outside it.

Write installation, usage, and public API guidance in [package documentation](package-documentation.md).

## Where a rule belongs

Put a rule in the first place that fits:

1. A test, when a test can check it. The test is the spec.
2. A short comment in the code, when the rule holds at one place.
3. A bullet in `packages/<name>/AGENTS.md`, when the rule holds across the package.
4. The root `AGENTS.md`, when the rule holds across all packages.

Write a rule only when a change could break it without noticing.

## Package AGENTS.md

Agents read this file on every change in the package. Keep it a short bullet list and create it only when the package has a rule.

```markdown
# extension-table

- `colwidth` holds percent of the table width, never pixels, because pixel widths break on resize.
- Keep the `data-colwidth` attribute name, because saved documents depend on it.
```

- One rule per bullet, with a short reason after "because".
- Name the code the rule is about, such as an attribute, a module, or a command.
- State the rule, not its history.
- Do not repeat rules from the root `AGENTS.md`.
- Delete a line when the rule no longer holds.

## Write every rule as public

This repository is public. Rules, comments, and files in a package leave out:

- Names of people, customers, and partners.
- Business reasons and quotes from chat or calls.
- Links or IDs that point into internal tools.
- Unreleased plans.
