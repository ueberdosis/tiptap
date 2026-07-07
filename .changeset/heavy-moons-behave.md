---
'@tiptap/core': patch
---

Add an internal `__internalViewFactory` option so alternative rendering engines can supply the `EditorView` instance constructed in `createView()`. Not part of the public API; behavior is unchanged when the option is not set.
