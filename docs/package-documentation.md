# Package documentation

Write user documentation in `packages/<name>/docs/`. These rules apply to contributors and agents.

The documentation must let a user install the package, use it, and understand every public API without reading its source.
Keep development context, plans, and historical decisions in [package references](package-references.md).

## Structure

Use `docs/README.md` as the entry point. Explain what the package does, when to use it, and where to start.
Link to each guide and API page from this entry point.

Cover the following topics. Small packages can use sections on one page. Split larger topics into focused files.

| Topic                      | Required content                                                                  |
| -------------------------- | --------------------------------------------------------------------------------- |
| Getting started            | A minimal working example with an expected result.                                |
| Installation               | Registry access, installation commands, dependencies, and supported environments. |
| Usage                      | Common tasks, setup, integration, and cleanup where needed.                       |
| Configuration              | Available options, defaults, valid values, and effects.                           |
| API                        | Every public export, command, method, event, and supported integration point.     |
| Limits and troubleshooting | Known limits, common errors, and ways to resolve them.                            |

Include migration guidance when a change requires users to update their code or stored data.
Explain concepts where users need them to understand behavior. Link to separate explanations when the topic is too large for a usage guide.

## Write for users

- Use plain English and explain package-specific terms before using them.
- Address the reader as "you" and write instructions as direct steps.
- Explain what the user can do, what they need to provide, and what result to expect.
- State prerequisites before the steps that need them.
- Start examples with the common case. Explain advanced options separately.
- Include imports and required setup in runnable examples. Identify any placeholders the user must replace.
- Explain internal details only when they affect usage, behavior, or limitations.
- Keep implementation history and future proposals in `references/`.

## Document the API

For each public API, describe its purpose, inputs, types, defaults, return value, and relevant failure behavior.
Explain side effects, lifecycle requirements, and constraints where they apply.
Include a working example and link to related APIs or usage guides.

Check API descriptions against the public exports and implementation. Verify examples against the local package.
Link to existing explanations rather than copying them across pages.

## Keep documentation current

Update affected documentation in the same change as the behavior or API it describes.
Describe the behavior implemented in the checkout. Clearly identify experimental APIs and their limits.

Keep examples small and focused. Avoid source-file inventories, test counts, and other snapshots that do not help users.
Check local links and run the smallest useful validation for changed examples.

Public website documentation also lives in the separate `ueberdosis/tiptap-docs` repository.
Package documentation must stand on its own. When a change affects both sets of documentation, keep their descriptions consistent and report any website update that remains outstanding.
