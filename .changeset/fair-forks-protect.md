---
'@tiptap/core': minor
---

Add a protected `updateViewState` method to `Editor` as an override point for framework-specific editor subclasses that need to coordinate work around ProseMirror view updates.

This allows integrations such as `@tiptap/react` to hook into editor view updates without adding framework-specific logic to the core package.
