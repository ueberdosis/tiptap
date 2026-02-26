---
'@tiptap/react': major
'@tiptap/vue': major
---

Move DragHandle component into framework packages as sub-imports.

`@tiptap/extension-drag-handle-react` and `@tiptap/extension-drag-handle-vue-3` have been removed. Use `@tiptap/react/drag-handle` and `@tiptap/vue/drag-handle` instead:

```typescript
// Before
import DragHandle from '@tiptap/extension-drag-handle-react'

// After
import { DragHandle } from '@tiptap/react/drag-handle'
```

```typescript
// Before
import { DragHandle } from '@tiptap/extension-drag-handle-vue-3'

// After
import { DragHandle } from '@tiptap/vue/drag-handle'
```
