---
"@tiptap/vue-3": patch
---

Fix a `useEditor` unmount crash by avoiding replacement of Vue-managed DOM nodes during teardown.
