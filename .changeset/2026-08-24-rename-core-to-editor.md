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

Also update the JSX runtime import, the `@jsxImportSource` pragma, and any
`declare module` blocks.

The `extensions` namespace is now `baseExtensions`. It holds the plugins the
editor always loads.

```ts
// before
import { extensions } from '@tiptap/core'

// after
import { baseExtensions } from '@tiptap/editor'
```
