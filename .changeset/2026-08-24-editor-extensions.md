---
'@tiptap/editor': major
---

`@tiptap/editor` now includes 20 more extensions as individual subpaths.

```ts
// before
import Highlight from '@tiptap/extension-highlight'
import Mention from '@tiptap/extension-mention'
import Youtube from '@tiptap/extension-youtube'

// after
import { Highlight } from '@tiptap/editor/extensions/highlight'
import { Mention } from '@tiptap/editor/extensions/mention'
import { Youtube } from '@tiptap/editor/extensions/youtube'
```

Every subpath exports names only, so replace default imports with named ones.

| Old                                      | New                                              |
| ---------------------------------------- | ------------------------------------------------ |
| `@tiptap/extension-highlight`            | `@tiptap/editor/extensions/highlight`            |
| `@tiptap/extension-typography`           | `@tiptap/editor/extensions/typography`           |
| `@tiptap/extension-ruby-text`            | `@tiptap/editor/extensions/ruby-text`            |
| `@tiptap/extension-invisible-characters` | `@tiptap/editor/extensions/invisible-characters` |
| `@tiptap/extension-audio`                | `@tiptap/editor/extensions/audio`                |
| `@tiptap/extension-youtube`              | `@tiptap/editor/extensions/youtube`              |
| `@tiptap/extension-twitch`               | `@tiptap/editor/extensions/twitch`               |
| `@tiptap/extension-find-and-replace`     | `@tiptap/editor/extensions/find-and-replace`     |
| `@tiptap/extension-table-of-contents`    | `@tiptap/editor/extensions/table-of-contents`    |
| `@tiptap/extension-unique-id`            | `@tiptap/editor/extensions/unique-id`            |
| `@tiptap/extension-file-handler`         | `@tiptap/editor/extensions/file-handler`         |
| `@tiptap/extension-code-block-lowlight`  | `@tiptap/editor/extensions/code-block-lowlight`  |
| `@tiptap/extension-mathematics`          | `@tiptap/editor/extensions/mathematics`          |
| `@tiptap/extension-node-range`           | `@tiptap/editor/extensions/node-range`           |
| `@tiptap/suggestion`                     | `@tiptap/editor/extensions/suggestion`           |
| `@tiptap/extension-mention`              | `@tiptap/editor/extensions/mention`              |
| `@tiptap/extension-emoji`                | `@tiptap/editor/extensions/emoji`                |
| `@tiptap/extension-drag-handle`          | `@tiptap/editor/extensions/drag-handle`          |
| `@tiptap/extension-drag-handle-react`    | `@tiptap/editor/extensions/drag-handle/react`    |
| `@tiptap/extension-drag-handle-vue-3`    | `@tiptap/editor/extensions/drag-handle/vue`      |

Import from the subpath you need, so one import never pulls in every extension.

`Emoji` no longer ships the default emoji set, which was 600 kB on every import.
Pass it explicitly:

```ts
import { Emoji } from '@tiptap/editor/extensions/emoji'
import { emojis } from '@tiptap/editor/extensions/emoji/data'

Emoji.configure({ emojis })
```

Third-party dependencies like `katex`, `lowlight`, `uuid` and `re2js` are
optional peer dependencies. Install only the ones your extensions need.
