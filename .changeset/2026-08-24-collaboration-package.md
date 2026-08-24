---
'@tiptap/editor': major
---

Collaboration and collaboration carets now ship from `@tiptap/editor`.

```ts
// before
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'

// after
import { Collaboration } from '@tiptap/editor/extensions/collaboration'
import { CollaborationCaret } from '@tiptap/editor/extensions/collaboration-caret'
```

The extensions own the Yjs binding. `yjs` and `@tiptap/y-tiptap` are optional
peer dependencies of `@tiptap/editor`.

Two position helpers are public now, for mapping editor positions across remote
updates. `getYRelativePosition` returns `null` and `getYAbsolutePosition`
returns `-1` when the editor is not collaborative.

```ts
import { getYAbsolutePosition, getYRelativePosition } from '@tiptap/editor/extensions/collaboration'
```
