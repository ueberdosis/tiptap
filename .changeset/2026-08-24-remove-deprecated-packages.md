---
'@tiptap/editor': major
---

The single-extension packages deprecated in Tiptap 3 are gone. Import from
`@tiptap/editor` instead.

| Old                                   | New                                          |
| ------------------------------------- | -------------------------------------------- |
| `@tiptap/extension-character-count`   | `@tiptap/editor/extensions/character-count`  |
| `@tiptap/extension-dropcursor`        | `@tiptap/editor/extensions/drop-cursor`      |
| `@tiptap/extension-gapcursor`         | `@tiptap/editor/extensions/gap-cursor`       |
| `@tiptap/extension-focus`             | `@tiptap/editor/extensions/focus`            |
| `@tiptap/extension-placeholder`       | `@tiptap/editor/extensions/placeholder`      |
| `@tiptap/extension-list-item`         | `@tiptap/editor/extensions/list`             |
| `@tiptap/extension-list-keymap`       | `@tiptap/editor/extensions/list`             |
| `@tiptap/extension-task-item`         | `@tiptap/editor/extensions/list`             |
| `@tiptap/extension-task-list`         | `@tiptap/editor/extensions/list`             |
| `@tiptap/extension-table-cell`        | `@tiptap/editor/extensions/table`            |
| `@tiptap/extension-table-header`      | `@tiptap/editor/extensions/table`            |
| `@tiptap/extension-table-row`         | `@tiptap/editor/extensions/table`            |
| `@tiptap/server-ai-toolkit`           | `@tiptap/editor/ai-toolkit`                  |
| `@tiptap/ai-toolkit`                  | `@tiptap/editor/ai-toolkit`                  |
| `@tiptap/ai-toolkit/streaming-reveal` | `@tiptap/editor/ai-toolkit/streaming-reveal` |
| `@tiptap/static-renderer`             | `@tiptap/editor/static-renderer`             |
| `@tiptap/static-renderer/json/react`  | `@tiptap/react/static-renderer`              |
| `@tiptap/static-renderer/pm/react`    | `@tiptap/react/static-renderer`              |

`@tiptap/extension-history` is gone too. It re-exported `UndoRedo` under the
old `History` name:

```ts
// before
import History from '@tiptap/extension-history'

// after
import { UndoRedo } from '@tiptap/editor/extensions/undo-redo'
```
