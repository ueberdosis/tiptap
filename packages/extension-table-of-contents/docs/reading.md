# Read the outline

`resolveTableOfContents` reads the outline from a document node. It needs no editor, no DOM and no
scroll position, so it also runs on the server, in tests and on stored JSON.

- Demo: [React](https://embed.tiptap.dev/preview/Extensions/TableOfContentsOutline/React) · [Vue](https://embed.tiptap.dev/preview/Extensions/TableOfContentsOutline/Vue)

```js
import { resolveTableOfContents } from '@tiptap/extension-table-of-contents'

const headings = resolveTableOfContents(editor.state.doc)
// [
//   { id: '0c9d…', level: 2, depth: 1, textContent: 'Introduction', pos: 0 },
//   { id: '7f1a…', level: 3, depth: 2, textContent: 'Background', pos: 42 },
// ]
```

Use it instead of the storage when:

- You render a page on the server and need its outline.
- You want the outline of a saved document without opening an editor.
- You draw the outline yourself and do not need `isActive` or `isScrolledOver`.

## In an editor

Read the outline in the editor's `update` event. Set
[`updateOnTransaction`](options.md#updateontransaction) to `false`, so the extension does not also
keep its storage in sync.

```js
import { Editor } from '@tiptap/core'
import { resolveTableOfContents, TableOfContents } from '@tiptap/extension-table-of-contents'
import StarterKit from '@tiptap/starter-kit'

const editor = new Editor({
  extensions: [StarterKit, TableOfContents.configure({ updateOnTransaction: false })],
  content: '<h2>Introduction</h2><p>Text</p><h3>Background</h3>',
  onCreate: ({ editor }) => render(resolveTableOfContents(editor.state.doc)),
  onUpdate: ({ editor }) => render(resolveTableOfContents(editor.state.doc)),
})
```

The extension still gives every heading an ID, so each item can link to its heading.

## From stored JSON

Turn the JSON into a document node with the schema of your extensions:

```js
import { getSchema } from '@tiptap/core'
import { resolveTableOfContents, TableOfContents } from '@tiptap/extension-table-of-contents'
import { Node } from '@tiptap/pm/model'
import StarterKit from '@tiptap/starter-kit'

const schema = getSchema([StarterKit, TableOfContents])
const doc = Node.fromJSON(schema, json)

const headings = resolveTableOfContents(doc)
```

A document saved from an editor with the extension already has IDs. For a document without them,
run [`generateTocIds`](heading-ids.md#ids-on-the-server) first, or the `id` of every heading is
`null`.

## resolveTableOfContents

```ts
resolveTableOfContents(doc: PMNode, options?: ResolveTableOfContentsOptions): TableOfContentsHeading[]
```

| Option        | Type                    | Default            | Value                                                       |
| ------------- | ----------------------- | ------------------ | ----------------------------------------------------------- |
| `anchorTypes` | `string[]`              | `['heading']`      | The node types that count as headings                       |
| `ranges`      | `Range[]`               | the whole document | The parts of the document to read                           |
| `ignore`      | `TableOfContentsIgnore` | every node is read | The nodes to leave out. [Leave nodes out](#leave-nodes-out) |

It returns the headings in document order. Each heading is a `TableOfContentsHeading`:

| Field         | Type             | Value                                                                        |
| ------------- | ---------------- | ---------------------------------------------------------------------------- |
| `id`          | `string \| null` | The heading's `data-toc-id`, or `null` if it has none yet                    |
| `level`       | `number`         | The level stored on the heading. `1` for a node type without a level         |
| `depth`       | `number`         | How far it is indented, starting at `1`. [Level and depth](#level-and-depth) |
| `textContent` | `string`         | The heading's text                                                           |
| `pos`         | `number`         | The heading's position in `doc`                                              |

Empty headings are left out. Headings inside other nodes, such as a blockquote, are included.

Pass the same `anchorTypes` you passed to the extension. `resolveTableOfContents` does not read the
extension's options.

## Only part of the document

Pass `ranges` to read only some parts. A heading counts only if it lies fully inside a range.

```js
const { from, to } = editor.state.selection
const headingsInSelection = resolveTableOfContents(editor.state.doc, { ranges: [{ from, to }] })
```

With several ranges, the result is still one outline:

- Headings are in document order, whatever order the ranges have.
- A heading in two overlapping ranges appears once.
- Depths are counted over all headings together, so a heading in the second range can be indented
  under a heading in the first.

Ranges outside the document are clamped to it. Positions change with every edit, so work out the
ranges from the current document each time.

## Leave nodes out

Pass `ignore` to leave nodes out of the outline. It is called with each node and its position, and
returns one of three answers:

| Return      | Result                                                      |
| ----------- | ----------------------------------------------------------- |
| `true`      | The node and everything in it are left out                  |
| `'descend'` | The node is left out, but headings inside it are still read |
| `false`     | The node is read as usual                                   |

For example, to leave out headings the current reader is not allowed to see:

```js
const headings = resolveTableOfContents(editor.state.doc, {
  ignore: (node, pos) => !canRead({ from: pos, to: pos + node.nodeSize }),
})
```

`canRead` is your own check. Depths are counted without the headings that were left out, so the
headings after them move up where needed.

## Level and depth

`level` is what the heading says: `2` for an H2. `depth` is how far the outline indents it. The
shallowest heading always has depth `1`, and a skipped level adds only one step.

| Headings in the document | `level` | `depth` |
| ------------------------ | ------- | ------- |
| H1, H2, H3               | 1, 2, 3 | 1, 2, 3 |
| H2, H3, H2               | 2, 3, 2 | 1, 2, 1 |
| H2, H4, H3               | 2, 4, 3 | 1, 2, 2 |

Use `depth` for indentation. A document whose H1 is the page title, with sections from H2 down,
then starts at the left edge.

This differs from `level` in the [storage items](storage.md#items). That one comes from
`getHeadlineLevel`, which starts counting at H1, so a document that starts at H2 gets level 2 for
its first item.

## Choose what the outline shows

`filterTableOfContents` keeps only the headings an outline should show and counts their depths
again.

```js
import { filterTableOfContents, resolveTableOfContents } from '@tiptap/extension-table-of-contents'

const headings = resolveTableOfContents(editor.state.doc)

// Only H2 and H3
const sections = filterTableOfContents(headings, { levels: [2, 3] })

// Only the two shallowest depths
const short = filterTableOfContents(headings, { maxDepth: 2 })
```

| Option     | Type       | Default     | Value                                       |
| ---------- | ---------- | ----------- | ------------------------------------------- |
| `levels`   | `number[]` | every level | The heading levels to keep                  |
| `maxDepth` | `number`   | no limit    | The deepest depth to keep, counted from `1` |

`levels` decides which headings the outline is about. Depths are counted after it, so
`{ levels: [2] }` gives a flat list.

`maxDepth` is counted from the shallowest kept heading, not from H1. `{ maxDepth: 1 }` keeps the
top headings, whatever level they are.

It returns new objects and leaves the headings you passed unchanged.

## getTableOfContentsDepths

The depth rule on its own. Use it when you build outline items yourself.

```js
import { getTableOfContentsDepths } from '@tiptap/extension-table-of-contents'

getTableOfContentsDepths([2, 4, 3, 2]) // [1, 2, 2, 1]
```

It takes the levels in document order and returns one depth per level.
