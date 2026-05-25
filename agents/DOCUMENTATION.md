# Documentation

We focus heavily on **User Experience** and **Developer Experience**. Every public API must be documented with JSDoc, including:

* `@param` and `@returns` annotations
* Argument descriptions
* At least one runnable example

This ensures our automated API docs are complete and examples are usable without extra context.

## Adding documentation to `https://tiptap.dev/docs`

The documentation of Tiptap lives on the [Tiptap Documentation](https://github.com/ueberdosis/tiptap-docs) repository. It is built with Next.js and MDX, which allows us to write documentation in Markdown while embedding React components for interactive examples.

When you add new features, extensions, or APIs to Tiptap, you should also add documentation for them in the `tiptap-docs` repository. This ensures that users can easily find information about how to use the new features and understand their capabilities.

If you don't know where it is on your system, ask the user to give you the path and access to the `tiptap-docs` repository. You can then create a new branch, add the necessary documentation files, and submit a pull request to the `tiptap-docs` repository with your changes.


If the user points you to the local path of the `tiptap-docs` repository, follow this workflow:

1. **Create a worktree** — Run `git worktree add -b docs/my-descriptive-branch-name <path-to-worktree> main` from inside the `tiptap-docs` repo. This creates a new branch from `main` with a dedicated working directory, leaving the current branch untouched.
2. **Make the content changes** — Edit the relevant MDX files inside the worktree (content lives in `src/content/`). Follow the existing conventions for style and structure.
3. **Inform the user** — Tell the user that the documentation changes are ready in the worktree and that they need to open a pull request in the `tiptap-docs` repository manually (e.g., via `gh pr create` in the worktree directory or through the GitHub UI).


Inside the `tiptap-docs` repository, content can be found in `/src/content` which is organized by product subgroups. Important groups for this repository are:

- `editor/` - includes the documentation of the core editor, extensions, API references and more.
- `guides/` - includes guides and tutorials for using Tiptap, you can write step-by-step guides here with embedded demos and code snippets.
- `collaboration/` - includes documentation related to Tiptap's collaboration features, such as the Collaboration Extension and how to set up real-time editing.
- `examples/` - includes example projects and code snippets demonstrating how to use Tiptap in different scenarios.

Our documentation demos point back to the deployed version of the Tiptap demos you can find at `/demos` on this repository.

When implementing a demo:

1. Import `import { CodeDemo } from '@/components/CodeDemo'` in the MDX file.
2. Link the path to the demo like this: `<CodeDemo path="/Marks/Code" />` where the path would be the path to the demo in the `demos` repository. In this case, it would be `demos/src/Marks/Code`.
