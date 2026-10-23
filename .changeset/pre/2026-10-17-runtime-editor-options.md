---
'@tiptap/core': patch
'@tiptap/react': patch
'@tiptap/vue': patch
---

Fix callback updates through `setOptions()`. Changes to initial options such as `content`, `extensions`, and `schemaSpec` are now ignored with a development warning.

Use `editor.commands.setContent(content)` to replace content. Create a new editor to change extensions or the schema. Use `EditorRuntimeOptions` and `getEditorRuntimeOptions()` to select options supported by `setOptions()`.
