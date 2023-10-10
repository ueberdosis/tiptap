---
tableOfContents: true
---

# Extensions

## Introduction
Extensions add new capabilities to Tiptap and you’ll read the word extension here very often. Actually, there are literal Extensions. Those can’t add to the schema, but can add functionality or change the behaviour of the editor.

There are also some extensions with more capabilities. We call them [nodes](/api/nodes) and [marks](/api/marks) which can render content in the editor.

## List of provided extensions
| Title                                                       | StarterKit ([view](/api/extensions/starter-kit)) | Source Code                                                                                       |
| ----------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| [BubbleMenu](/api/extensions/bubble-menu)                   | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bubble-menu/)          |
| [CharacterCount](/api/extensions/character-count)           | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-character-count/)      |
| [Collaboration](/api/extensions/collaboration)              | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-collaboration/)        |
| [CollaborationCursor](/api/extensions/collaboration-cursor) | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-collaboration-cursor/) |
| [Color](/api/extensions/color)                              | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-color/)                |
| [Dropcursor](/api/extensions/dropcursor)                    | Included                                         | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-dropcursor/)           |
| [FloatingMenu](/api/extensions/floating-menu)               | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-floating-menu/)        |
| [Focus](/api/extensions/focus)                              | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-focus/)                |
| [FontFamily](/api/extensions/font-family)                   | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-font-family/)          |
| [Gapcursor](/api/extensions/gapcursor)                      | Included                                         | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-gapcursor/)            |
| [History](/api/extensions/history)                          | Included                                         | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-history/)              |
| [InvisibleCharacters](/api/extensions/invisible-characters) | –                                                | Requires a Tiptap Pro subscription                                                                |
| [Mathematics](/api/extensions/mathematics)                  | –                                                | Requires a Tiptap Pro subscription                                                                |
| [Placeholder](/api/extensions/placeholder)                  | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-placeholder/)          |
| [StarterKit](/api/extensions/starter-kit)                   | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/starter-kit/)                    |
| [TextAlign](/api/extensions/text-align)                     | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-text-align/)           |
| [Typography](/api/extensions/typography)                    | –                                                | [GitHub](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-typography/)           |
| [UniqueID](/api/extensions/unique-id)                       | –                                                | Requires a Tiptap Pro subscription                                                                |

You don’t have to use it, but we prepared a `@tiptap/starter-kit` which includes the most common extensions. Read more about [`StarterKit`](/guide/configuration#default-extensions).

Also a list of community extensions can be found in the [Awesome Tiptap Repository](https://github.com/ueberdosis/awesome-tiptap#community-extensions). There is also a [Discussion Thread](https://github.com/ueberdosis/tiptap/discussions/2973) about community extensions.

## How extensions work
Although Tiptap tries to hide most of the complexity of ProseMirror, it’s built on top of its APIs and we recommend you to read through the [ProseMirror Guide](https://ProseMirror.net/docs/guide/) for advanced usage. You’ll have a better understanding of how everything works under the hood and get more familiar with many terms and jargon used by Tiptap.

Existing [nodes](/api/nodes), [marks](/api/marks) and [extensions](/api/extensions) can give you a good impression on how to approach your own extensions. To make it easier to switch between the documentation and the source code, we linked to the file on GitHub from every single extension documentation page.

We recommend to start with customizing existing extensions first, and create your own extensions with the gained knowledge later. That’s why all the examples below extend existing extensions, but all examples will work on newly created extensions aswell.

## Create a new extension
You’re free to create your own extensions for Tiptap. Here is the boilerplate code that’s needed to create and register your own extension:

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
})
```

You can easily bootstrap a new extension via our CLI.

```bash
npm init tiptap-extension
```

Learn [more about custom extensions in our guide](/guide/custom-extensions).
