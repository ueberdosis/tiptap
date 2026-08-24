---
'@tiptap/editor': major
---

`@tiptap/core` is now `@tiptap/editor`.

```ts
// before
import { Editor, Node } from '@tiptap/core'

// after
import { Editor, Node } from '@tiptap/editor'
```

Rename it everywhere else too: `@tiptap/editor/jsx-runtime`, the
`@jsxImportSource` pragma, and `declare module` blocks.
