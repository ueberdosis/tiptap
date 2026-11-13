---
'@tiptap/vue': major
'@tiptap/extension-drag-handle-vue': major
---

Vue 2 support is removed. `@tiptap/vue-3` is now `@tiptap/vue`, and `@tiptap/extension-drag-handle-vue-3` is now `@tiptap/extension-drag-handle-vue`.

Update imports and dependencies:

```diff
- import { EditorContent } from '@tiptap/vue-3'
+ import { EditorContent } from '@tiptap/vue'

- import DragHandle from '@tiptap/extension-drag-handle-vue-3'
+ import DragHandle from '@tiptap/extension-drag-handle-vue'
```

Vue 2 users must migrate to Vue 3 before using the new packages. The planned Codemod Registry package `@tiptap/codemod-v3-to-v4` updates package imports and dependencies.
