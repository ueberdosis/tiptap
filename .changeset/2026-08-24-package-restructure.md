---
'@tiptap/editor': major
---

Tiptap now ships its open source editor API through three main packages:
`@tiptap/editor`, `@tiptap/react`, and `@tiptap/vue`.

This release removes the large set of small packages that previously made up a
Tiptap installation. The same APIs now live under clear subpaths. You can see
which package owns an API from its import path, and you no longer need to keep
dozens of Tiptap package versions in sync.

## Package names

`@tiptap/core` is now `@tiptap/editor`.

```ts
// before
import { Editor, Node } from '@tiptap/core'

// after
import { Editor, Node } from '@tiptap/editor'
```

Update JSX runtime imports, `@jsxImportSource` pragmas, and `declare module`
blocks in the same way.

The `extensions` export from the old core package is now called
`baseExtensions`. It contains the extensions that the editor always loads.

```ts
// before
import { extensions } from '@tiptap/core'

// after
import { baseExtensions } from '@tiptap/editor'
```

`@tiptap/vue-3` is now `@tiptap/vue`.

```ts
// before
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'

// after
import { EditorContent, useEditor } from '@tiptap/vue'
import { BubbleMenu } from '@tiptap/vue/menus'
```

Vue 2 is no longer supported. `@tiptap/vue-2` and
`@tiptap/extension-drag-handle-vue-2` have been removed. Stay on Tiptap 3 if
your application still uses Vue 2.

## Extensions

Extensions now ship from `@tiptap/editor/extensions/*`. These subpaths use
named exports. Replace default imports when you update an import path.

```ts
// before
import Document from '@tiptap/extension-document'
import Bold from '@tiptap/extension-bold'
import Highlight from '@tiptap/extension-highlight'

// after
import { Document } from '@tiptap/editor/extensions/document'
import { Bold } from '@tiptap/editor/extensions/bold'
import { Highlight } from '@tiptap/editor/extensions/highlight'
```

The subpath name normally matches the old package name. For example:

| Old package                                  | New import                                               |
| -------------------------------------------- | -------------------------------------------------------- |
| `@tiptap/extension-audio`                    | `@tiptap/editor/extensions/audio`                        |
| `@tiptap/extension-code-block-lowlight`      | `@tiptap/editor/extensions/code-block-lowlight`          |
| `@tiptap/extension-emoji`                    | `@tiptap/editor/extensions/emoji`                        |
| `@tiptap/extension-file-handler`             | `@tiptap/editor/extensions/file-handler`                 |
| `@tiptap/extension-find-and-replace`         | `@tiptap/editor/extensions/find-and-replace`             |
| `@tiptap/extension-invisible-characters`     | `@tiptap/editor/extensions/invisible-characters`         |
| `@tiptap/extension-mathematics`              | `@tiptap/editor/extensions/mathematics`                  |
| `@tiptap/extension-mention`                  | `@tiptap/editor/extensions/mention`                      |
| `@tiptap/extension-node-range`               | `@tiptap/editor/extensions/node-range`                   |
| `@tiptap/extension-ruby-text`                | `@tiptap/editor/extensions/ruby-text`                    |
| `@tiptap/extension-table-of-contents`        | `@tiptap/editor/extensions/table-of-contents`            |
| `@tiptap/extension-twitch`                   | `@tiptap/editor/extensions/twitch`                       |
| `@tiptap/extension-typography`               | `@tiptap/editor/extensions/typography`                   |
| `@tiptap/extension-unique-id`                | `@tiptap/editor/extensions/unique-id`                    |
| `@tiptap/extension-youtube`                  | `@tiptap/editor/extensions/youtube`                      |
| `@tiptap/suggestion`                         | `@tiptap/editor/extensions/suggestion`                   |
| `@tiptap/extension-collaboration`            | `@tiptap/editor/extensions/collaboration`                |
| `@tiptap/extension-collaboration-caret`      | `@tiptap/editor/extensions/collaboration-caret`          |

The editor package also contains the common nodes, marks, menus, and behavior
extensions. This includes `document`, `text`, `paragraph`, `heading`, `bold`,
`italic`, `link`, `text-style`, `bubble-menu`, `floating-menu`,
`character-count`, `placeholder`, `drop-cursor`, `gap-cursor`, and
`undo-redo`.

List and table extensions use grouped subpaths:

```ts
import {
  BulletList,
  ListItem,
  OrderedList,
  TaskItem,
  TaskList,
} from '@tiptap/editor/extensions/list'
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/editor/extensions/table'
```

The separate list and table packages have been removed. This includes
`@tiptap/extension-bullet-list`, `@tiptap/extension-ordered-list`,
`@tiptap/extension-list-item`, `@tiptap/extension-task-item`,
`@tiptap/extension-task-list`, `@tiptap/extension-table-cell`,
`@tiptap/extension-table-header`, and `@tiptap/extension-table-row`.

`@tiptap/extension-history` has also been removed. It exported `UndoRedo` under
the old `History` name.

```ts
// before
import History from '@tiptap/extension-history'

// after
import { UndoRedo } from '@tiptap/editor/extensions/undo-redo'
```

Each extension subpath has its own build. Importing one extension does not load
all other extensions.

### Emoji data

`Emoji` no longer includes the default emoji data in its main import. Import
the data separately and pass it to the extension.

```ts
import { Emoji } from '@tiptap/editor/extensions/emoji'
import { emojis } from '@tiptap/editor/extensions/emoji/data'

Emoji.configure({ emojis })
```

## Kits

Kits now live under `@tiptap/editor/kits/*`. They also use named exports.

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

`TextStyleKit` is available from `@tiptap/editor/kits/text-style`. Individual
list, table, and text style extensions remain available from their extension
subpaths.

## ProseMirror

`@tiptap/pm` is now part of `@tiptap/editor`. Keep the final part of the old
import path and add it after `@tiptap/editor/pm/`.

```ts
// before
import { Node } from '@tiptap/pm/model'
import { Plugin } from '@tiptap/pm/state'

// after
import { Node } from '@tiptap/editor/pm/model'
import { Plugin } from '@tiptap/editor/pm/state'
```

The available subpaths are `changeset`, `commands`, `dropcursor`, `gapcursor`,
`history`, `inputrules`, `keymap`, `model`, `schema-list`, `state`, `tables`,
`transform`, and `view`.

ProseMirror is a direct dependency of `@tiptap/editor`. Remove direct
`prosemirror-*` dependencies that you added only for Tiptap. Loading two copies
of `prosemirror-model` can break node wrapping and splitting.

## Markdown and HTML

Markdown and HTML rendering now ship from editor subpaths.

```ts
// before
import { Markdown } from '@tiptap/markdown'
import { generateHTML } from '@tiptap/html'
import { generateHTML as generateServerHTML } from '@tiptap/html/server'

// after
import { Markdown } from '@tiptap/editor/markdown'
import { generateHTML } from '@tiptap/editor/html'
import { generateHTML as generateServerHTML } from '@tiptap/editor/html/server'
```

`marked` now ships with `@tiptap/editor`. `happy-dom` remains an optional peer
dependency because only `@tiptap/editor/html/server` needs it. Install
`happy-dom` when you use server-side HTML rendering.

## Collaboration

Collaboration and collaboration carets now ship from editor subpaths.

```ts
import { Collaboration } from '@tiptap/editor/extensions/collaboration'
import { CollaborationCaret } from '@tiptap/editor/extensions/collaboration-caret'
```

`yjs` and `@tiptap/y-tiptap` are optional peer dependencies. Install them when
you use collaboration.

The collaboration subpath also exports `getYAbsolutePosition` and
`getYRelativePosition`. These helpers map editor positions across remote
updates. `getYRelativePosition` returns `null` when the editor is not
collaborative. `getYAbsolutePosition` returns `-1` in the same case.

## AI Toolkit

The AI Toolkit now ships from `@tiptap/editor`.

```ts
// before
import { AiToolkit } from '@tiptap/ai-toolkit'
import { AiInsertReveal } from '@tiptap/ai-toolkit/streaming-reveal'

// after
import { AiToolkit } from '@tiptap/editor/ai-toolkit'
import { AiInsertReveal } from '@tiptap/editor/ai-toolkit/streaming-reveal'
```

Imports from `@tiptap/server-ai-toolkit` also move to
`@tiptap/editor/ai-toolkit`.

## Static Renderer

The framework-independent Static Renderer now ships from `@tiptap/editor`.
The React renderer ships from `@tiptap/react`.

```ts
import { renderToHTMLString, renderToMarkdown } from '@tiptap/editor/static-renderer'
import { renderToReactElement } from '@tiptap/react/static-renderer'
```

This replaces the root and deep imports from `@tiptap/static-renderer`, such as
`/json/html-string`, `/pm/html-string`, `/pm/markdown`, `/json/react`, and
`/pm/react`.

## Optional dependencies

Some extensions use third-party packages that most editors do not need. These
packages are optional peer dependencies of `@tiptap/editor`:

- `@tiptap/y-tiptap` and `yjs` for collaboration
- `emoji-regex` and `is-emoji-supported` for emoji handling
- `highlight.js` and `lowlight` for code highlighting
- `katex` for mathematics
- `re2js` for find and replace
- `uuid` for unique IDs
- `happy-dom` for server-side HTML rendering

Install only the dependencies required by the subpaths you use. If one is
missing, your package manager does not install it automatically.

## Migration checklist

1. Replace `@tiptap/core` with `@tiptap/editor`.
2. Replace extension packages with `@tiptap/editor/extensions/*` subpaths.
3. Change extension and kit default imports to named imports.
4. Move kits to `@tiptap/editor/kits/*`.
5. Move ProseMirror imports to `@tiptap/editor/pm/*`.
6. Update Markdown, HTML, collaboration, AI Toolkit, and Static Renderer imports.
7. Replace `@tiptap/vue-3` with `@tiptap/vue`.
8. Install the optional peer dependencies required by your extensions.

The Tiptap 4 codemod covers the old package names and subpaths. It also splits
mixed Static Renderer imports between the editor and React packages.
