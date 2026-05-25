# Documentation

We focus heavily on **User Experience** and **Developer Experience**. Every public API must be documented with JSDoc, including:

- `@param` and `@returns` annotations
- Argument descriptions
- At least one runnable example

This ensures our automated API docs are complete and examples are usable without extra context.

## Adding documentation to `https://tiptap.dev/docs`

The documentation of Tiptap lives on the [Tiptap Documentation](https://github.com/ueberdosis/tiptap-docs) repository. It is built with Next.js and MDX, which allows us to write documentation in Markdown while embedding React components for interactive examples.

When you add new features, extensions, or APIs to Tiptap, you should also add documentation for them in the `tiptap-docs` repository. This ensures that users can easily find information about how to use the new features and understand their capabilities.

If you don't know where it is on your system, ask the user to give you the path and access to the `tiptap-docs` repository. You can then create a new branch, add the necessary documentation files, and submit a pull request to the `tiptap-docs` repository with your changes.

Inside the `tiptap-docs` repository, content can be found in `/src/content` which is organized by product subgroups. Important groups for this repository are:

- `editor/` - includes the documentation of the core editor, extensions, API references and more.
- `guides/` - includes guides and tutorials for using Tiptap, you can write step-by-step guides here with embedded demos and code snippets.
- `collaboration/` - includes documentation related to Tiptap's collaboration features, such as the Collaboration Extension and how to set up real-time editing.
- `examples/` - includes example projects and code snippets demonstrating how to use Tiptap in different scenarios.

Our documentation demos point back to the deployed version of the Tiptap demos you can find at `/demos` on this repository.

When implementing a demo:

1. Import `import { CodeDemo } from '@/components/CodeDemo'` in the MDX file.
2. Link the path to the demo like this: `<CodeDemo path="/Marks/Code" />` where the path would be the path to the demo in the `demos` repository. In this case, it would be `demos/src/Marks/Code`.
