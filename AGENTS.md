# AGENTS

## What this project is

Tiptap is a headless rich text editor toolkit built on top of ProseMirror. It is designed as a composable system of focused packages rather than a single monolithic editor.

This repository is a monorepo.

Key locations:

- `packages/` contains the published packages, core modules, framework bindings, and first-party extensions.
- `demos/` contains the demo app and example implementations used for development, manual verification, and end-to-end testing.
- `tests/` contains end-to-end tests that run against the demos.
- `.changeset/` contains Changesets used for versioning and release notes.
- `CONTRIBUTING.md` contains the repository contribution policy. Read it before opening issues or pull requests, especially for issue assignment, Changesets, AI usage, and PR requirements.

## Tooling conventions

- Use `pnpm` for package management and workspace scripts.
- Use ESLint for semantic correctness, code quality, and avoiding logical issues.
- Use Prettier for code formatting.
- Use Cypress for end-to-end testing.
- Use Vitest for unit testing.
- When GitHub is involved, check whether the `gh` CLI is available and use it for GitHub-related tasks.

## How to think about the codebase

Treat Tiptap as a collection of small, focused building blocks.

Important principles:

- Keep extensions separated and composable.
- Avoid hardcoding cross-extension behavior unless it is absolutely necessary.
- Prefer extension interoperability through editor events, explicit APIs, exposed options, or other extension hooks.
- If compatibility between extensions is needed, first look for a way to express that through editor events, extension options, or public integration points.
- Favor predictable, explicit, testable behavior over hidden magic.

Do not assume a single framework. Many packages are framework-agnostic, with separate bindings for React and Vue.

## Developer Experience is a product goal

Tiptap focuses heavily on Developer Experience. Our users, and AI systems using Tiptap, should be able to understand and use the API correctly with minimal friction.

That means:

- Public APIs must be easy to discover and understand.
- Naming must be clear and meaningful.
- Options should be explicit and well documented.
- Escape hatches should exist when reasonable so users can adapt behavior without patching internals.
- Defaults should be strong, but users should retain control.

## Documentation expectations

Add good and extensive JSDoc for any user-facing API surface, including:

- functions
- commands
- options
- classes
- types
- interfaces
- properties
- events
- extension configuration

JSDoc should:

- explain what the API does
- explain why or when to use it when that is not obvious
- describe parameters and return values clearly
- include examples when helpful
- stay accurate as behavior changes

If a change affects a public API, update the documentation in the same change.

## API design expectations

When adding or changing user-facing behavior:

- Prefer meaningful option names over vague or overly generic names.
- Provide escape hatches where reasonable.
- Do not lock users into one hardcoded workflow if a configurable design is possible.
- Expose control through options or explicit APIs when default behavior will not fit every integration.
- Keep defaults sensible, but avoid making assumptions that users cannot override.

If something is not supported by default, prefer adding a clear option or extension point instead of forcing users into internal patches or forks.

## Monorepo guidance

When working in this repository:

- Look in `packages/` for the source of published functionality.
- Look in `demos/` for runnable examples and manual verification targets.
- Keep changes scoped to the relevant package or extension when possible.
- Avoid leaking package-specific behavior into unrelated extensions.
- Prefer small, focused changes over broad cross-package rewrites unless the architecture clearly requires it.

## Changesets and releases

This repository uses Changesets for versioning and changelog generation.

Guidelines:

- Add a Changeset for user-facing changes.
- Write Changesets for users, not maintainers.
- Keep changelog text focused on visible outcomes and API changes.
- Do not add internal-only noise to release notes.

Publishing is handled by the repository's automated workflow using trusted publishing. Do not publish packages manually.

## Validation mindset

Before considering work complete:

- ensure relevant linting, tests, and builds pass
- add or update tests when behavior changes
- update demos when they help verify user-visible behavior
- update JSDoc and public-facing documentation when APIs or behavior change

## Contribution flow awareness

Pull requests are expected to follow the repository contribution policy:

- PRs must be linked to an issue
- contributors should request assignment or maintainer approval on the issue before opening a PR
- if an agent creates a PR, always use `.github/pull_request_template.md` as the base and fill it out as completely and accurately as possible
- include a Changeset when required

## General implementation style

- Prefer the smallest correct change.
- Keep code deterministic and explicit.
- Avoid unnecessary abstractions.
- Preserve separation between extensions.
- Build APIs that are understandable by both humans and AI tools.
