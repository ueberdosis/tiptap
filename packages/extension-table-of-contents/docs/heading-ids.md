# Heading IDs

Every anchor gets an ID. The outline uses it to point at the heading, and the editor's HTML shows
it, so links like `#introduction` work.

The ID is stored twice on the node: as `data-toc-id`, which the extension reads, and as `id`, which
becomes the HTML `id` attribute.

```html
<h2 id="0c9d…" data-toc-id="0c9d…">Introduction</h2>
```

## When IDs are written

- **When the editor starts.** Every non-empty anchor without an ID gets one. If two anchors share
  an ID, the later one gets a new one.
- **After every change.** A new heading, a pasted heading or a split heading gets an ID in the same
  step.

IDs are written to the document, so they are saved with it. This also happens while
[`updateOnTransaction`](options.md#updateontransaction) is `false`.

Empty headings get no ID until they have text. The editor writes IDs only in the browser. On the
server, use [`generateTocIds`](#ids-on-the-server).

To choose the IDs, set [`getId`](options.md#getid).

## IDs on the server

`generateTocIds` adds the same IDs to a JSON document without an editor. Use it before you render
a document statically, for example with `@tiptap/static-renderer`.

```js
import { generateTocIds, TableOfContents } from '@tiptap/extension-table-of-contents'
import StarterKit from '@tiptap/starter-kit'

const doc = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Introduction' }] },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Details' }] },
  ],
}

const docWithIds = generateTocIds(doc, [StarterKit, TableOfContents])
// Both headings now have `id` and `data-toc-id`
```

| Parameter       | Type          | Value                                                                     |
| --------------- | ------------- | ------------------------------------------------------------------------- |
| `doc`           | `JSONContent` | The document                                                              |
| `extensions`    | `Extensions`  | The extensions of your editor. Must include `TableOfContents`             |
| `extensionName` | `string`      | The name of the extension, if you renamed it. Default `'tableOfContents'` |

It returns a new document and leaves the one you passed unchanged. It reads `anchorTypes` and
`getId` from the configured extension. It throws if the extension is missing.
