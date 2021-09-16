---
tableOfContents: true
---

# Configuration

## toc

## Introduction
For most cases it’s enough to say where tiptap should be rendered (`element`), what functionalities you want to enable (`extensions`) and what the initial document should be (`content`). 

A few more things can be configured though. Let’s look at a fully configured editor example.

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
6. disable the loading of [the default CSS](https://github.com/ueberdosis/tiptap/tree/main/packages/core/src/style.ts) (which is not much anyway).

## Nodes, marks and extensions
Most editing features are bundled as [node](/api/nodes), [mark](/api/marks) or [extension](/api/extensions). Import what you need and pass them as an array to the editor.

Here is the minimal setup with only three extensions:

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
})
```

### Configure extensions
Most extensions can be configured. Add a `.configure()` and pass an object to it. 

The following example will disable the default heading levels 4, 5 and 6 and just allow 1, 2 and 3:

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

Have a look at the documentation of the extension you are using to learn more about their settings.

### Default extensions
We have bundled a few of the most common extensions into a `StarterKit` extension. Here is how you to use that:

```js
import StarterKit from '@tiptap/starter-kit'

new Editor({
  extensions: [
    StarterKit,
  ],
})
```

You can even pass a configuration for all included extensions as an object. Just prefix the configuration with the extension name:

```js
import StarterKit from '@tiptap/starter-kit'

new Editor({
  extensions: StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
  }),
})
```

The `StarterKit` extension loads the most common extensions, but not all available extensions. If you want to load additional extensions or add a custom extension, add them to the `extensions` array:

```js
import StarterKit from '@tiptap/starter-kit'
import Strike from '@tiptap/extension-strike'

new Editor({
  extensions: [
    StarterKit,
    Strike,
  ],
})
```

Don’t want to load a specific extension from the `StarterKit`? Just pass `false` to the config:

```js
import StarterKit from '@tiptap/starter-kit'

new Editor({
  extensions: [
    StarterKit.configure({
      history: false,
    }),
  ],
})
```

You will probably see something like that in collaborative editing examples. The [`Collaboration`](/api/extensions/collaboration) comes with its own history extension. You need to remove or disable the default [`History`](/api/extensions/history) extension to avoid conflicts.
