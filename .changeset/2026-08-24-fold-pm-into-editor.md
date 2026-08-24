---
'@tiptap/editor': major
---

`@tiptap/pm` is now part of `@tiptap/editor`. ProseMirror is a direct dependency
of `@tiptap/editor`, so you no longer install it separately.

```ts
// before
import { Node } from '@tiptap/pm/model'
import { Plugin } from '@tiptap/pm/state'

// after
import { Node } from '@tiptap/editor/pm/model'
import { Plugin } from '@tiptap/editor/pm/state'
```

Every subpath keeps its name: `changeset`, `commands`, `dropcursor`,
`gapcursor`, `history`, `inputrules`, `keymap`, `model`, `schema-list`,
`state`, `tables`, `transform`, `view`.

Keep `prosemirror-*` out of your own dependencies. When `prosemirror-model`
loads twice, wrapping and splitting nodes fails and the editor logs a warning.
