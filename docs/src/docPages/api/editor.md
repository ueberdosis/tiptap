---
tableOfContents: true
---

# Editor

## toc

## Introduction
This class is a central building block of tiptap. It does most of the heavy lifting of creating a working  [ProseMirror](https://ProseMirror.net/) editor such as creating the [`EditorView`](https://ProseMirror.net/docs/ref/#view.EditorView), setting the initial [`EditorState`](https://ProseMirror.net/docs/ref/#state.Editor_State) and so on.

## Methods
The editor instance will provide a bunch of public methods. They’ll help you to work with the editor.

Don’t confuse methods with [commands](/api/commands). Commands are used to change the state of editor (content, selection, and so on) and only return `true` or `false`. Methods are regular functions and can return anything.

| Method                | Parameters                                                                                                  | Description                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `can()`               | -                                                                                                           | Check if a command or a command chain can be executed. Without executing it. |
| `chain()`             | -                                                                                                           | Create a command chain to call multiple commands at once.                    |
| `destroy()`           | –                                                                                                           | Stops the editor instance and unbinds all events.                            |
| `getHTML()`           | –                                                                                                           | Returns the current content as HTML.                                         |
| `getJSON()`           | –                                                                                                           | Returns the current content as JSON.                                         |
| `getAttributes()`     | `name` Name of the node or mark                                                                             | Get attributes of the currently selected node or mark.                       |
| `isActive()`          | `name` Name of the node or mark<br>`attrs` Attributes of the node or mark                                   | Returns if the currently selected node or mark is active.                    |
| `isEditable`          | -                                                                                                           | Returns whether the editor is editable.                                      |
| `isEmpty`             | -                                                                                                           | Check if there is no content.                                                |
| `getCharacterCount()` | -                                                                                                           | Get the number of characters for the current document.                       |
| `registerPlugin()`    | `plugin` A ProseMirror plugin<br>`handlePlugins` Control how to merge the plugin into the existing plugins. | Register a ProseMirror plugin.                                               |
| `setOptions()`        | `options` A list of options                                                                                 | Update editor options.                                                       |
| `unregisterPlugin()`  | `name` The plugins name                                                                                     | Unregister a ProseMirror plugin.                                             |

## Settings

### Element
The `element` specifies the HTML element the editor will be binded too. The following code will integrate tiptap with an element with the `.element` class:

```js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  element: document.querySelector('.element'),
  extensions: [
    StarterKit,
  ],
})
```

You can even initiate your editor before mounting it to an element. This is useful when your DOM is not yet available. Just leave out the `element`, we’ll create one for you. Append it to your container at a later date like that:

```js
yourContainerElement.append(editor.options.element)
```

### Extensions
It’s required to pass a list of extensions to the `extensions` property, even if you only want to allow paragraphs.

```js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Highlight from '@tiptap/extension-highlight'

new Editor({
  // Use the default extensions
  extensions: [
    StarterKit,
  ],

  // … or use specific extensions
  extensions: [
    Document,
    Paragraph,
    Text,
  ],

  // … or both
  extensions: [
    StarterKit,
    Highlight,
  ],
})
```

### Content
With the `content` property you can provide the initial content for the editor. This can be HTML or JSON.

```js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: [
    StarterKit,
  ],
})
```

### Editable
The `editable` property determines if users can write into the editor.

```js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: [
    StarterKit,
  ],
  editable: false,
})
```

### Autofocus
With `autofocus` you can force the cursor to jump in the editor on initialization.

```js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  extensions: [
    StarterKit,
  ],
  autofocus: false,
})
```

| Value     | Description                                            |
| --------- | ------------------------------------------------------ |
| `'start'` | Sets the focus to the beginning of the document.       |
| `'end'`   | Sets the focus to the end of the document.             |
| `Number`  | Sets the focus to a specific position in the document. |
| `true`    | Enables autofocus.                                     |
| `false`   | Disables autofocus.                                    |
| `null`    | Disables autofocus.                                    |

### Enable input rules
By default, tiptap enables all [input rules](/guide/custom-extensions/#input-rules). With `enableInputRules` you can disable that.

```js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: [
    StarterKit,
  ],
  enableInputRules: false,
})
```

### Enable paste rules
By default, tiptap enables all [paste rules](/guide/custom-extensions/#paste-rules). With `enablePasteRules` you can disable that.

```js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: [
    StarterKit,
  ],
  enablePasteRules: false,
})
```

### Inject CSS
By default, tiptap injects [a little bit of CSS](https://github.com/ueberdosis/tiptap/tree/main/packages/core/src/style.ts). With `injectCSS` you can disable that.

```js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  extensions: [
    StarterKit,
  ],
  injectCSS: false,
})
```

### Editor props
For advanced use cases, you can pass `editorProps` which will be handled by [ProseMirror](https://prosemirror.net/docs/ref/#view.EditorProps). Here is an example how you can pass a few [Tailwind](https://tailwindcss.com/) classes to the editor container, but there is a lot more you can do.

```js
new Editor({
  // Learn more: https://prosemirror.net/docs/ref/#view.EditorProps
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
    },
  },
})
```

You can use that to hook into event handlers and pass - for example - a custom paste handler, too.

### Parse options
Passed content is parsed by ProseMirror. To hook into the parsing, you can pass `parseOptions` which are then handled by [ProseMirror](https://prosemirror.net/docs/ref/#model.ParseOptions).

```js
new Editor({
  // Learn more: https://prosemirror.net/docs/ref/#model.ParseOptions
  parseOptions: {
    preserveWhitespace: 'full',
  },
})
```
