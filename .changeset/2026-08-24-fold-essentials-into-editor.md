---
'@tiptap/editor': major
---

The extensions every editor needs now ship inside `@tiptap/editor`, one subpath
each. `@tiptap/extensions` and the six mark packages are gone.

```ts
// before
import CharacterCount from '@tiptap/extensions'
import Bold from '@tiptap/extension-bold'
import Link from '@tiptap/extension-link'

// after
import { CharacterCount } from '@tiptap/editor/extensions/character-count'
import { Bold } from '@tiptap/editor/extensions/bold'
import { Link } from '@tiptap/editor/extensions/link'
```

| Old | New |
| --- | --- |
| `@tiptap/extensions` | `@tiptap/editor/extensions/character-count`, `/drop-cursor`, `/focus`, `/gap-cursor`, `/placeholder`, `/selection`, `/trailing-node`, `/undo-redo` |
| `@tiptap/extension-bold` | `@tiptap/editor/extensions/bold` |
| `@tiptap/extension-code` | `@tiptap/editor/extensions/code` |
| `@tiptap/extension-italic` | `@tiptap/editor/extensions/italic` |
| `@tiptap/extension-link` | `@tiptap/editor/extensions/link` |
| `@tiptap/extension-strike` | `@tiptap/editor/extensions/strike` |
| `@tiptap/extension-underline` | `@tiptap/editor/extensions/underline` |

Every subpath exports names only. Replace default imports with named ones, as
shown above.
