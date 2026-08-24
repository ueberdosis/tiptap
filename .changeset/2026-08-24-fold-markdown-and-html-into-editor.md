---
'@tiptap/editor': major
---

`@tiptap/markdown` and `@tiptap/html` now ship inside `@tiptap/editor`.

```ts
// before
import { Markdown } from '@tiptap/markdown'
import { generateHTML } from '@tiptap/html'
import { generateHTML } from '@tiptap/html/server'

// after
import { Markdown } from '@tiptap/editor/markdown'
import { generateHTML } from '@tiptap/editor/html'
import { generateHTML } from '@tiptap/editor/html/server'
```

`marked` ships with `@tiptap/editor`. `happy-dom` stays an optional peer
dependency, because only `@tiptap/editor/html/server` needs it. Install it
yourself if you render HTML in Node.
