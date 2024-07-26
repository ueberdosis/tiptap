---
"@tiptap/extension-floating-menu": major
"@tiptap/extension-bubble-menu": major
"@tiptap/extension-mention": major
"@tiptap/suggestion": major
"@tiptap/react": major
"@tiptap/vue-2": major
"@tiptap/vue-3": major
---

Removed tippy.js and replaced it with [Floating UI](https://floating-ui.com/) - a newer, more lightweight and customizable floating element library.

This change is breaking existing menu implementations and will require a manual migration.

**Affected packages:**

- `@tiptap/extension-floating-menu`
- `@tiptap/extension-bubble-menu`
- `@tiptap/extension-mention`
- `@tiptap/suggestion`
- `@tiptap/react`
- `@tiptap/vue-2`
- `@tiptap/vue-3`

Make sure to remove `tippyOptions` from the `FloatingMenu` and `BubbleMenu` components, and replace them with the new `options` object. Check our documentation to see how to migrate your existing menu implementations.

- [FloatingMenu](https://tiptap.dev/docs/editor/extensions/functionality/floatingmenu)
- [BubbleMenu](https://tiptap.dev/docs/editor/extensions/functionality/bubble-menu)

The new `options` object is compatible with all components that use these extensions.
