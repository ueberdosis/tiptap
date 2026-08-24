---
'@tiptap/editor': major
---

The extensions every editor needs now ship inside `@tiptap/editor`, one subpath
each. Twenty separate packages and `@tiptap/extensions` are gone.

```ts
// before
import Document from '@tiptap/extension-document'
import Bold from '@tiptap/extension-bold'
import { CharacterCount } from '@tiptap/extensions'

// after
import { Document } from '@tiptap/editor/extensions/document'
import { Bold } from '@tiptap/editor/extensions/bold'
import { CharacterCount } from '@tiptap/editor/extensions/character-count'
```

Every subpath exports names only, so replace default imports with named ones.

**Nodes** `blockquote` `code-block` `document` `hard-break` `heading`
`horizontal-rule` `image` `list` `paragraph` `table` `text`

**Marks** `bold` `code` `italic` `link` `strike` `underline`

**Behaviour** `character-count` `drop-cursor` `focus` `gap-cursor` `placeholder`
`selection` `trailing-node` `undo-redo`

**Menus** `bubble-menu` `floating-menu`

`@tiptap/extension-list` and `@tiptap/extension-table` keep their grouped
exports, so `BulletList`, `TaskItem`, `TableRow` and friends all come from
`@tiptap/editor/extensions/list` and `/table`. The one-extension packages
`@tiptap/extension-bullet-list` and `@tiptap/extension-ordered-list` are gone;
import from `/extensions/list` instead.

`linkifyjs` and `@floating-ui/dom` ship with `@tiptap/editor` now. Each subpath
builds separately, so you only pay for them if you import `link` or a menu.
