# Schema
Unlike many other editors, tiptap is based on a [schema](https://prosemirror.net/docs/guide/#schema) that defines how your content is structured. That enables you to define the kind of nodes that may occur in the document, its attributes and the way they can be nested.

This schema is *very* strict. You can’t use any HTML element or attribute that is not defined in your schema.

Let me give you one example: If you paste something like `This is <strong>important</strong>` into tiptap, don’t have any extension that handles `strong` tags registered, you’ll only see `This is important` – without the strong tags.

## Table of Contents

## How a schema looks like

The most simple schema for a typical *ProseMirror* editor is looking something like that:

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

:::warning Out of date
This content is written for tiptap 1 and needs an update.
:::

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

## Difference between a Node and a Mark

*Nodes* are like blocks of content, for example paragraphs, headings, code blocks, blockquotes and many more.

*Marks* can apply a different style to specific parts of text inside a *Node*. That’s the case for **bold**, *italic* or ~~striked~~ text. [Links](#) are *Marks*, too.

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

## Generate HTML from ProseMirror JSON

If you need to render the content on the server side, e. g. for a blog post that was written with tiptap, you’ll probably need a way to do just that without an actual editor instance.

That’s what `generateHtml()` is for. It’s a utility function that renders HTML without an actual editor instance.

:::warning Work in progress
Currently, that works only in the browser (client side), but we plan to bring this to Node.js (to use it on the server side).
:::

<demo name="Api/Schema/GenerateHtml" highlight="6,29-33"/>

### Converting JSON<>HTML with PHP

We needed to do the same thing in PHP at some point, so we published libraries to convert ProseMirror JSON to HTML and vice-versa:

* [ueberdosis/prosemirror-php](https://github.com/ueberdosis/prosemirror-php) (PHP)
* [ueberdosis/prosemirror-to-html](https://github.com/ueberdosis/prosemirror-to-html) (PHP)
* [ueberdosis/html-to-prosemirror](https://github.com/ueberdosis/html-to-prosemirror) (PHP)
