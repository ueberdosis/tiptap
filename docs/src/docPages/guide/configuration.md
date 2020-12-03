# Configure the editor

## toc

## Introduction
There are a few things you can control when initializing a new editor. For most cases it’s enough to say where tiptap should be rendered (`element`), what functionalities you want to enable (`extensions`) and what the initial document should be (`content`). A few more things can be configured though. Let’s look at a fully configured editor example.

## Configure the editor
To add your configuration, pass [an object with settings](/api/editor) to the `Editor` class, like shown here:

```js
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

new Editor({
  element: document.querySelector('.element'),
  extensions: [
    Document,
    Paragraph,
    Text,
  ],
  content: '<p>Example Text</p>',
  autofocus: true,
  editable: true,
  injectCSS: false,
})
```

This will do the following:

1. bind tiptap to `.element`,
2. load the `Document`, `Paragraph` and `Text` extensions,
3. set the initial content,
4. place the cursor in the editor after initialization,
5. make the text editable (but that’s the default anyway), and
6. disable the loading of [the default CSS](https://github.com/ueberdosis/tiptap-next/tree/main/packages/core/src/style.ts) (which is not much anyway).

## Configure extensions
A lot of the extension can be configured, too. Add an `.configure()` to the extension and pass an object to it. The following example will disable the default heading levels 4, 5 and 6:

```js
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Heading from '@tiptap/extension-heading'

new Editor({
  element: document.querySelector('.element'),
  extensions: [
    Document,
    Paragraph,
    Text,
    Heading.configure({
      levels: [1, 2, 3],
    }),
  ],
})
```

Have a look at the documentation of the extension you’re using to learn more about their settings.
