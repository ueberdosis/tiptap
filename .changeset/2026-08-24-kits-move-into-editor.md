---
'@tiptap/editor': major
---

Kits live under `@tiptap/editor/kits/*` now, and `@tiptap/starter-kit` is gone.

```ts
// before
import StarterKit from '@tiptap/starter-kit'
import { ListKit } from '@tiptap/extension-list'
import { TableKit } from '@tiptap/extension-table'

// after
import { StarterKit } from '@tiptap/editor/kits/starter'
import { ListKit } from '@tiptap/editor/kits/list'
import { TableKit } from '@tiptap/editor/kits/table'
```

`ListKit` and `TableKit` no longer come from the list and table extension
subpaths. Import them from `kits/` instead. The individual extensions are
unchanged: `BulletList`, `TaskItem`, `TableRow` and the rest still come from
`@tiptap/editor/extensions/list` and `/table`.

Each kit is its own entry that references its members rather than inlining
them, so importing both a kit and one of its extensions gives you one copy.
