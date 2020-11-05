# Schema

## toc

## Introduction
Unlike many other editors, tiptap is based on a [schema](https://prosemirror.net/docs/guide/#schema) that defines how your content is structured. That enables you to define the kind of nodes that may occur in the document, its attributes and the way they can be nested.

This schema is *very* strict. You can’t use any HTML element or attribute that is not defined in your schema.

Let me give you one example: If you paste something like `This is <strong>important</strong>` into tiptap, don’t have any extension that handles `strong` tags registered, you’ll only see `This is important` – without the strong tags.

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

We register three nodes here. `document`, `paragraph` and `text`. `document` is the root node which allows one or more block nodes as children (`content: 'block+'`). Since `paragraph` is in the group of block nodes (`group: 'block'`) our document can only contain paragraphs. Our paragraphs allow zero or more inline nodes as children (`content: 'inline*'`) so there can only be `text` in it. `parseDOM` defines how a node can be parsed from pasted HTML. `toDOM` defines how it will be rendered in the DOM.

In tiptap every node, mark and extension is living in its own file. This allows us to split the logic. Under the hood the whole schema will be merged together:

```js
// the tiptap schema API
import { createNode } from '@tiptap/core'

const Document = createNode({
  name: 'document',
  topNode: true,
  content: 'block+',
})

const Paragraph = createNode({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [
      { tag: 'p' },
    ]
  },
  renderHTML({ attributes }) {
    return ['p', attributes, 0]
  },
})

const Text = createNode({
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
> The content expression for this node, as described in the schema guide. When not given, the node does not allow any content.

#### Marks
> The marks that are allowed inside of this node. May be a space-separated string referring to mark names or groups, "_" to explicitly allow all marks, or "" to disallow marks. When not given, nodes with inline content default to allowing all marks, other nodes default to not allowing marks.

#### Group
> The group or space-separated groups to which this node belongs, which can be referred to in the content expressions for the schema.

#### Inline
> Should be set to true for inline nodes. (Implied for text nodes.)

#### Atom
> Can be set to true to indicate that, though this isn't a leaf node, it doesn't have directly editable content and should be treated as a single unit in the view.

#### Selectable
> Controls whether nodes of this type can be selected as a node selection. Defaults to true for non-text nodes.

#### Draggable
> Determines whether nodes of this type can be dragged without being selected. Defaults to false.

#### Code
> Can be used to indicate that this node contains code, which causes some commands to behave differently.

#### Defining
> Determines whether this node is considered an important parent node during replace operations (such as paste). Non-defining (the default) nodes get dropped when their entire content is replaced, whereas defining nodes persist and wrap the inserted content. Likewise, in inserted content the defining parents of the content are preserved when possible. Typically, non-default-paragraph textblock types, and possibly list items, are marked as defining.

#### Isolating
> When enabled (default is false), the sides of nodes of this type count as boundaries that regular editing operations, like backspacing or lifting, won't cross. An example of a node that should probably have this enabled is a table cell.

### The mark schema
#### Inclusive
> Whether this mark should be active when the cursor is positioned at its end (or at its start when that is also the start of the parent node). Defaults to true.

#### Excludes
> Determines which other marks this mark can coexist with. Should be a space-separated strings naming other marks or groups of marks When a mark is added to a set, all marks that it excludes are removed in the process. If the set contains any mark that excludes the new mark but is not, itself, excluded by the new mark, the mark can not be added an the set. You can use the value "_" to indicate that the mark excludes all marks in the schema.

> Defaults to only being exclusive with marks of the same type. You can set it to an empty string (or any string not containing the mark's own name) to allow multiple marks of a given type to coexist (as long as they have different attributes).

#### Group
> The group or space-separated groups to which this mark belongs.

#### Spanning
> Determines whether marks of this type can span multiple adjacent nodes when serialized to DOM/HTML. Defaults to true.

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
    Document(),
    Paragraph(),
    Text(),
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
  Document(),
  Paragraph(),
  Text(),
  // add more extensions here
])
```
