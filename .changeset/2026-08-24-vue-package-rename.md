---
'@tiptap/vue': major
---

`@tiptap/vue-3` is now `@tiptap/vue`.

```ts
// before
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'

// after
import { EditorContent, useEditor } from '@tiptap/vue'
import { BubbleMenu } from '@tiptap/vue/menus'
```

Vue 2 is no longer supported. `@tiptap/vue-2` and
`@tiptap/extension-drag-handle-vue-2` are gone. Stay on Tiptap 3 if you need
Vue 2.
