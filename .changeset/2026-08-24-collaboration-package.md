---
'@tiptap/collaboration': major
---

New package `@tiptap/collaboration` replaces `@tiptap/extension-collaboration`
and `@tiptap/extension-collaboration-caret`.

```ts
// before
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'

// after
import { Collaboration } from '@tiptap/collaboration'
import { CollaborationCaret } from '@tiptap/collaboration/caret'
```

It owns the Yjs binding, so `yjs` and `@tiptap/y-tiptap` are its peer
dependencies and no other package pulls them in.

Two position helpers are public now, for mapping editor positions across remote
updates. `getYRelativePosition` returns `null` and `getYAbsolutePosition`
returns `-1` when the editor is not collaborative.

```ts
import { getYAbsolutePosition, getYRelativePosition } from '@tiptap/collaboration'
```
