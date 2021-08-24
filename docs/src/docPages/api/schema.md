---
tableOfContents: true
---

# Schema

## toc

## Introduction
Unlike many other editors, tiptap is based on a [schema](https://prosemirror.net/docs/guide/#schema) that defines how your content is structured. That enables you to define the kind of nodes that may occur in the document, its attributes and the way they can be nested.

This schema is *very* strict. You can’t use any HTML element or attribute that is not defined in your schema.

Let me give you one example: If you paste something like `This is <strong>important</strong>` into tiptap, but don’t have any extension that handles `strong` tags, you’ll only see `This is important` – without the strong tags.

## How a schema looks like
When you’ll work with the provided extensions only, you don’t have to care that much about the schema. If you’re building your own extensions, it’s probably helpful to understand how the schema works. Let’s look at the most simple schema for a typical ProseMirror editor:

```js
// the underlying ProseMirror schema
{
  nodes: {
    document: {
      content: 'block+',
    },
    paragraph: {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM: () => ['p', 0],
    },
    text: {
      group: 'inline',
    },
  },
}
```

We register three nodes here. `doc`, `paragraph` and `text`. `doc` is the root node which allows one or more block nodes as children (`content: 'block+'`). Since `paragraph` is in the group of block nodes (`group: 'block'`) our document can only contain paragraphs. Our paragraphs allow zero or more inline nodes as children (`content: 'inline*'`) so there can only be `text` in it. `parseDOM` defines how a node can be parsed from pasted HTML. `toDOM` defines how it will be rendered in the DOM.

In tiptap every node, mark and extension is living in its own file. This allows us to split the logic. Under the hood the whole schema will be merged together:

```js
// the tiptap schema API
import { Node } from '@tiptap/core'

const Document = Node.create({
  name: 'doc',
  topNode: true,
  content: 'block+',
})

const Paragraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [
      { tag: 'p' },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['p', HTMLAttributes, 0]
  },
})

const Text = Node.create({
  name: 'text',
  group: 'inline',
})
```

## Nodes and marks

### Differences
Nodes are like blocks of content, for example paragraphs, headings, code blocks, blockquotes and many more.

Marks can be applied to specific parts of a node. That’s the case for **bold**, *italic* or ~~striked~~ text. [Links](#) are marks, too.

### The node schema

#### Content
The content attribute defines exactly what kind of content the node can have. ProseMirror is really strict with that. That means, content which doesn’t fit the schema is thrown away. It expects a name or group as a string. Here are a few examples:

```js
Node.create({
  // must have one or more blocks
  content: 'block+',

  // must have zero or more blocks
  content: 'block*',

  // allows all kinds of 'inline' content (text or hard breaks)
  content: 'inline*',

  // must not have anything else than 'text'
  content: 'text*',

  // can have one or more paragraphs, or lists (if lists are used)
  content: '(paragraph|list?)+',

  // must have exact one heading at the top, and one or more blocks below
  content: 'heading block+'
})
```

#### Marks
You can define which marks are allowed inside of a node with the `marks` setting of the schema. Add a one or more names or groups of marks, allow all or disallow all marks like this:

```js
Node.create({
  // allows only the 'bold' mark
  marks: 'bold',

  // allows only the 'bold' and 'italic' marks
  marks: 'bold italic',

  // allows all marks
  marks: '_',

  // disallows all marks
  marks: '',
})
```

#### Group
Add this node to a group of extensions, which can be referred to in the [content](#content) attribute of the schema.

```js
Node.create({
  // add to 'block' group
  group: 'block',

  // add to 'inline' group
  group: 'inline',

  // add to 'block' and 'list' group
  group: 'block list',
})
```

#### Inline
Nodes can be rendered inline, too. When setting `inline: true` nodes are rendered in line with the text. That’s the case for mentions. The result is more like a mark, but with the functionality of a node. One difference is the resulting JSON document. Multiple marks are applied at once, inline nodes would result in a nested structure.

```js
Node.create({
  // renders nodes in line with the text, for example
  inline: true,
})
```

For some cases where you want features that aren’t available in marks, for example a node view, try if an inline node would work:

```js
Node.create({
  name: 'customInlineNode',
  group: 'inline',
  inline: true,
  content: 'text*',
})
```

#### Atom
Nodes with `atom: true` aren’t directly editable and should be treated as a single unit. It’s not so likely to use that in a editor context, but this is how it would look like:

```js
Node.create({
  atom: true,
})
```

One example is the [`Mention`](/api/nodes/mention) extension, which somehow looks like text, but behaves more like a single unit. As this doesn’t have editable text content, it’s empty when you copy such node. Good news though, you can control that. Here is the example from the [`Mention`](/api/nodes/mention) extension:

```js
// Used to convert an atom node to plain text
renderText({ node }) {
  return `@${node.attrs.id}`
},
```

#### Selectable
Besides the already visible text selection, there is an invisible node selection. If you want to make your nodes selectable, you can configure it like this:

```js
Node.create({
  selectable: true,
})
```

#### Draggable
All nodes can be configured to be draggable (by default they aren’t) with this setting:

```js
Node.create({
  draggable: true,
})
```

#### Code
Users expect code to behave very differently. For all kind of nodes containing code, you can set `code: true` to take this into account.

```js
Node.create({
  code: true,
})
```

#### Defining
Nodes get dropped when their entire content is replaced (for example, when pasting new content) by default. If a node should be kept for such replace operations, configure them as `defining`.

Typically, that applies to [`Blockquote`](/api/nodes/blockquote), [`CodeBlock`](/api/nodes/code-block), [`Heading`](/api/nodes/heading), and [`ListItem`](/api/nodes/list-item).

```js
Node.create({
  defining: true,
})
```

#### Isolating
For nodes that should fence the cursor for regular editing operations like backspacing, for example a TableCell, set `isolating: true`.

```js
Node.create({
  isolating: true,
})
```

#### Allow gap cursor
The [`Gapcursor`](/api/extensions/gapcursor) extension registers a new schema attribute to control if gap cursors are allowed everywhere in that node.

```js
Node.create({
  allowGapCursor: false,
})
```

#### Table roles
The [`Table`](/api/nodes/table) extension registers a new schema attribute to configure which role an Node has. Allowed values are `table`, `row`, `cell`, and `header_cell`.

```js
Node.create({
  tableRole: 'cell',
})
```

### The mark schema
#### Inclusive
If you don’t want the mark to be active when the cursor is at its end, set inclusive to `false`. For example, that’s how it’s configured for [`Link`](/api/marks/link) marks:

```js
Mark.create({
  inclusive: false,
})
```

#### Excludes
By default all nodes can be applied at the same time. With the excludes attribute you can define which marks must not coexist with the mark. For example, the inline code mark excludes any other mark (bold, italic, and all others).

```js
Mark.create({
  // must not coexist with the bold mark
  excludes: 'bold'
  // exclude any other mark
  excludes: '_',
})
```

#### Group
Add this mark to a group of extensions, which can be referred to in the content attribute of the schema.

```js
Mark.create({
  // add this mark to the 'basic' group
  group: 'basic',
  // add this mark to the 'basic' and the 'foobar' group
  group: 'basic foobar',
})
```

#### Code
Users expect code to behave very differently. For all kind of marks containing code, you can set `code: true` to take this into account.

```js
Mark.create({
  code: true,
})
```

#### Spanning
By default marks can span multiple nodes when rendered as HTML. Set `spanning: false` to indicate that a mark must not span multiple nodes.

```js
Mark.create({
  spanning: false,
})
```

## Get the underlying ProseMirror schema
There are a few use cases where you need to work with the underlying schema. You’ll need that if you’re using the tiptap collaborative text editing features or if you want to manually render your content as HTML.

### Option 1: With an Editor
If you need this on the client side and need an editor instance anyway, it’s available through the editor:

```js
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

const editor = new Editor({
  extensions: [
    Document,
    Paragraph,
    Text,
    // add more extensions here
  ])
})

const schema = editor.schema
```

### Option 2: Without an Editor
If you just want to have the schema *without* initializing an actual editor, you can use the `getSchema` helper function. It needs an array of available extensions and conveniently generates a ProseMirror schema for you:

```js
import { getSchema } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

const schema = getSchema([
  Document,
  Paragraph,
  Text,
  // add more extensions here
])
```
