# Schema

Tiptap is based on ProseMirror and just like ProseMirror does, tiptap works with an underlying schema. This schema has all the information about nodes, marks and your custom extension. It’s used to convert your content to HTML and vice-versa. Tiptap handles the schema for you, but there are a few use cases where you need the schema, without an actual editor.

## Get the underlying ProseMirror schema

If you just want to have the schema without initializing an actual editor, you can use the `getSchema` function. This function needs an array of available extensions and generates a ProseMirror schema for you:

```js
import { getSchema } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

const schema = getSchema([
  new Document,
  new Paragraph,
  new Text,
  // add more extensions here
])
```

You might need this on the server side, if you’re using the collaborative text editing features of tiptap.

## Generate HTML from ProseMirror JSON

<demo name="Api/Schema" />

## Old Content

:::warning Out of date
This content is written for tiptap 1 and needs an update.
:::

Unlike many other editors, tiptap is based on a [schema](https://prosemirror.net/docs/guide/#schema) that defines how your content is structured. This enables you to define the kind of nodes that may occur in the document, its attributes and the way they can be nested.

This schema is *very* strict. You can’t use any HTML-element or attribute that is not defined in your schema.

For example if you paste something like `This is <strong>important</strong>` into tiptap and don’t have registered any extension that handles `strong` tags, you’ll only see `This is important`.

## How a schema looks like

The most simple schema for a typical *ProseMirror* editor is looking something like that.

```js
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

In tiptap we define every node in its own `Extension` class instead. This allows us to split logic per node. Under the hood the schema will be merged together.

```js
class Document extends Node {
  name = 'document'
  topNode = true

  schema() {
    return {
      content: 'block+',
    }
  }
}

class Paragraph extends Node {
  name = 'paragraph'

  schema() {
    return {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM: () => ['p', 0],
    }
  }
}

class Text extends Node {
  name = 'text'

  schema() {
    return {
      group: 'inline',
    }
  }
}
```
