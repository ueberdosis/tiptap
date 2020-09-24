# Get the underlying ProseMirror schema

There are a few use cases where you need to work with the underlying schema. You’ll need that if you’re using the tiptap collaborative text editing features or if you want to manually render your content as HTML.

## Option 1: With an Editor
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

## Option 2: Without an Editor
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
