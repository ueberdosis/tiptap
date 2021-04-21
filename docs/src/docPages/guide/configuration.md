# Configuration

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
6. disable the loading of [the default CSS](https://github.com/ueberdosis/tiptap/tree/main/packages/core/src/style.ts) (which is not much anyway).

## Nodes, marks and extensions
Most features are packed into [nodes](/api/nodes), [marks](/api/marks) and [extensions](/api/extensions). Import what you need and pass them as an Array to the editor and you are good to go. Here is the minimal setup with only three extensions:

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
Most extensions can be configured. Add a `.configure()` to pass an object to it. The following example will disable the default heading levels 4, 5 and 6:

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

Have a look at the documentation of the extension you use to learn more about their settings.

### Default extensions
We have put together a few of the most common extensions and provide a `defaultExtensions()` helper to load them. Here is how you to use that:

```js
import { Editor, defaultExtensions } from '@tiptap/starter-kit'

new Editor({
  extensions: defaultExtensions(),
})
```

And you can even pass configuration for all default extensions as an object. Just prefix the configuration with the extension name:

```js
import { Editor, defaultExtensions } from '@tiptap/starter-kit'

new Editor({
  extensions: defaultExtensions({
    heading: {
      levels: [1, 2, 3],
    },
  }),
})
```

The `defaultExtensions()` function returns an array, so if you want to load them and add some custom extensions you could write it like that:

```js
import { Editor, defaultExtensions } from '@tiptap/starter-kit'
import Strike from '@tiptap/extension-strike'

new Editor({
  extensions: [
    ...defaultExtensions(),
    Strike,
  ],
})
```

Don’t want to load a specific extension? Just filter it out:

```js
import { Editor, defaultExtensions } from '@tiptap/starter-kit'

new Editor({
  extensions: [
    ...defaultExtensions().filter(extension => extension.name !== 'history'),
  ],
})
```

You’ll probably see something like that in collaborative editing examples. The [`Collaboration`](/api/extensions/collaboration) comes with its own history extension, you need to remove the default [`History`](/api/extensions/history) extension to avoid conflicts.
