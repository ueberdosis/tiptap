# Extensions

## toc

## Introduction
Extensions are the way to add functionality to tiptap. By default tiptap comes bare, without any of them, but we have a long list of extensions that are ready to be used with tiptap.

## List of provided extensions
| Title                                                       | Default Extension | Source Code                                                                                            |
| ----------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| [Collaboration](/api/extensions/collaboration)              | –                 | [GitHub](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-collaboration/)        |
| [CollaborationCursor](/api/extensions/collaboration-cursor) | –                 | [GitHub](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-collaboration-cursor/) |
| [Dropcursor](/api/extensions/dropcursor)                    | –                 | [GitHub](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-dropcursor/)           |
| [Focus](/api/extensions/focus)                              | –                 | [GitHub](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-focus/)                |
| [FontFamily](/api/extensions/font-family)                   | –                 | [GitHub](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-font-family/)          |
| [Gapcursor](/api/extensions/gapcursor)                      | –                 | [GitHub](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-gapcursor/)            |
| [History](/api/extensions/history)                          | –                 | [GitHub](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-history/)              |
| [TextAlign](/api/extensions/text-align)                     | –                 | [GitHub](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-text-align/)           |
| [Typography](/api/extensions/typography)                    | –                 | [GitHub](https://github.com/ueberdosis/tiptap-next/blob/main/packages/extension-typography/)           |

You don’t have to use it, but we prepared a `@tiptap/vue-starter-kit` which includes the most common extensions. Learn [how you can use the `defaultExtensions()`](/examples/basic).

## Create a new extension
You’re free to create your own extensions for tiptap. Here is the boilerplate code that’s need to create and register your own extension:

```js
import { Extension } from '@tiptap/core'

const CustomExtension = Extension.create({
  // Your code here
})

const editor = new Editor({
  extensions: [
    // Register your custom extension with the editor.
    CustomExtension,
    // … and don’t forget all other extensions.
    Document,
    Paragraph,
    Text,
    // …
  ],
```

Learn [more about custom extensions in our guide](/guide/build-extensions).

### ProseMirror plugins
ProseMirror has a fantastic eco system with many amazing plugins. If you want to use one of them, you can register them with tiptap like that:

```js
import { history } from 'prosemirror-history'

const History = Extension.create({
  addProseMirrorPlugins() {
    return [
      history(),
      // …
    ]
  },
})
```
