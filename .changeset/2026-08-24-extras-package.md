---
'@tiptap/extras': major
---

New package `@tiptap/extras` replaces 22 optional extension packages, one
subpath each.

```ts
// before
import Highlight from '@tiptap/extension-highlight'
import Mention from '@tiptap/extension-mention'
import Youtube from '@tiptap/extension-youtube'

// after
import { Highlight } from '@tiptap/extras/highlight'
import { Mention } from '@tiptap/extras/mention'
import { Youtube } from '@tiptap/extras/embeds/youtube'
```

Every subpath exports names only, so replace default imports with named ones.

| Old | New |
| --- | --- |
| `@tiptap/extension-highlight` | `@tiptap/extras/highlight` |
| `@tiptap/extension-text-align` | `@tiptap/extras/text-align` |
| `@tiptap/extension-subscript` | `@tiptap/extras/subscript` |
| `@tiptap/extension-superscript` | `@tiptap/extras/superscript` |
| `@tiptap/extension-typography` | `@tiptap/extras/typography` |
| `@tiptap/extension-details` | `@tiptap/extras/details` |
| `@tiptap/extension-ruby-text` | `@tiptap/extras/ruby-text` |
| `@tiptap/extension-invisible-characters` | `@tiptap/extras/invisible-characters` |
| `@tiptap/extension-audio` | `@tiptap/extras/media/audio` |
| `@tiptap/extension-youtube` | `@tiptap/extras/embeds/youtube` |
| `@tiptap/extension-twitch` | `@tiptap/extras/embeds/twitch` |
| `@tiptap/extension-find-and-replace` | `@tiptap/extras/find-and-replace` |
| `@tiptap/extension-table-of-contents` | `@tiptap/extras/table-of-contents` |
| `@tiptap/extension-unique-id` | `@tiptap/extras/unique-id` |
| `@tiptap/extension-file-handler` | `@tiptap/extras/file-handler` |
| `@tiptap/extension-code-block-lowlight` | `@tiptap/extras/code-block-lowlight` |
| `@tiptap/extension-mathematics` | `@tiptap/extras/mathematics` |
| `@tiptap/extension-node-range` | `@tiptap/extras/node-range` |
| `@tiptap/suggestion` | `@tiptap/extras/suggestion` |
| `@tiptap/extension-mention` | `@tiptap/extras/mention` |
| `@tiptap/extension-emoji` | `@tiptap/extras/emoji` |
| `@tiptap/extension-drag-handle` | `@tiptap/extras/drag-handle` |
| `@tiptap/extension-drag-handle-react` | `@tiptap/extras/drag-handle/react` |
| `@tiptap/extension-drag-handle-vue-3` | `@tiptap/extras/drag-handle/vue` |

`@tiptap/extras` has no root export. Import from the subpath you need, so one
import never pulls in every extension.

`Emoji` no longer ships the default emoji set, which was 600 kB on every import.
Pass it explicitly:

```ts
import { Emoji } from '@tiptap/extras/emoji'
import { emojis } from '@tiptap/extras/emoji/data'

Emoji.configure({ emojis })
```

Third-party dependencies like `katex`, `lowlight`, `uuid` and `re2js` are
optional peer dependencies. Install only the ones your extensions need.
