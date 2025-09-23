---
'@tiptap/extension-floating-menu': patch
'@tiptap/react': patch
'@tiptap/vue-2': patch
'@tiptap/vue-3': patch
---

Add `appendTo` support to `FloatingMenu` and pass it through in React/Vue 2/Vue 3 for both `BubbleMenu` and `FloatingMenu` to allow fixing clipping/z-index issues.
