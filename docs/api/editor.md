---
tableOfContents: true
---

# Editor

## Introduction
This class is a central building block of tiptap. It does most of the heavy lifting of creating a working  [ProseMirror](https://ProseMirror.net/) editor such as creating the [`EditorView`](https://ProseMirror.net/docs/ref/#view.EditorView), setting the initial [`EditorState`](https://ProseMirror.net/docs/ref/#state.Editor_State) and so on.

## Methods
The editor instance will provide a bunch of public methods. Methods are regular functions and can return anything. They’ll help you to work with the editor.

Don’t confuse methods with [commands](/api/commands). Commands are used to change the state of editor (content, selection, and so on) and only return `true` or `false`.

### can()
Check if a command or a command chain can be executed – without actually executing it. Can be very helpful to enable/disable or show/hide buttons.

```js
// Returns `true` if the undo command can be executed
editor.can().undo()
```

### chain()
Create a command chain to call multiple commands at once.

```js
// Execute two commands at once
editor.chain().toggleBold().focus().run()
```

### destroy()
Stops the editor instance and unbinds all events.

```js
// Hasta la vista, baby!
editor.destroy()
```

### getHTML()
Returns the current editor document as HTML

```js
editor.getHTML()
```

### getJSON()
Returns the current editor document as JSON.

```js
editor.getJSON()
```

### getText(options?)
Returns the current editor document as plain text.

| Parameter  | Type                           | Description              |
| ---------- | ------------------------------ | ------------------------ |
| options | { blockSeparator?: string, textSerializers?: Record<string, TextSerializer>} | Options for the serialization.  |

```js
// Give me plain text!
editor.getText()
// Add two line breaks between nodes
editor.getText({ blockSeparator: "\n\n" })
```

### getAttributes(nameOrType)
Get attributes of the currently selected node or mark.

| Parameter  | Type                           | Description              |
| ---------- | ------------------------------ | ------------------------ |
| typeOrName | string \| NodeType \| MarkType | Name of the node or mark |

```js
editor.getAttributes('link').href
```

### isActive(name, attributes = {})
Returns if the currently selected node or mark is active.

| Parameter              | Type                | Description                    |
| ---------------------- | ------------------- | ------------------------------ |
| name                   | string \| null      | Name of the node or mark       |
| attributes             | Record<string, any> | Attributes of the node or mark |

```js
// Check if it’s a heading
editor.isActive('heading')
// Check if it’s a heading with a specific attribute value
editor.isActive('heading', { level: 2 })
// Check if it has a specific attribute value, doesn’t care what node/mark it is
editor.isActive({ textAlign: 'justify' })
```

### getCharacterCount()
Get the number of characters for the current document.

```js
editor.getCharacterCount()
```

### registerPlugin(plugin, handlePlugins)
Register a ProseMirror plugin.

| Parameter      | Type                                               | Description                                               |
| -------------- | -------------------------------------------------- | --------------------------------------------------------- |
| plugin         | Plugin                                             | A ProseMirror plugin                                      |
| handlePlugins? | (newPlugin: Plugin, plugins: Plugin[]) => Plugin[] | Control how to merge the plugin into the existing plugins |

### setOptions(options = {})
Update editor options.

| Parameter | Type                   | Description       |
| --------- | ---------------------- | ----------------- |
| options   | Partial<EditorOptions> | A list of options |

```js
// Add a class to an existing editor instance
editor.setOptions({
  editorProps: attributes: {
    class: 'prose',
  },
})
```

### unregisterPlugin(nameOrPluginKey)
Unregister a ProseMirror plugin.

| Parameter       | Type                | Description      |
| --------------- | ------------------- | ---------------- |
| nameOrPluginKey | string \| PluginKey | The plugins name |

## Getters

### isEditable
Returns whether the editor is editable or read-only.

```js
editor.isEditable
```

### isEmpty
Check if there is content.

```js
editor.isEmpty
```

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
For advanced use cases, you can pass `editorProps` which will be handled by [ProseMirror](https://prosemirror.net/docs/ref/#view.EditorProps). You can use it to override various editor events or change editor DOM element attributes, for example to add some Tailwind classes. Here is an example:

```js
new Editor({
  // Learn more: https://prosemirror.net/docs/ref/#view.EditorProps
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
    },
    transformPastedText(text) {
      return text.toUpperCase()
    }
  }
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
