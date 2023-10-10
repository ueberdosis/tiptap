---
tableOfContents: true
---

# Editor

## Introduction
This class is a central building block of Tiptap. It does most of the heavy lifting of creating a working  [ProseMirror](https://ProseMirror.net/) editor such as creating the [`EditorView`](https://ProseMirror.net/docs/ref/#view.EditorView), setting the initial [`EditorState`](https://ProseMirror.net/docs/ref/#state.Editor_State) and so on.

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

### getText()
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

### getAttributes()
Get attributes of the currently selected node or mark.

| Parameter  | Type                           | Description              |
| ---------- | ------------------------------ | ------------------------ |
| typeOrName | string \| NodeType \| MarkType | Name of the node or mark |

```js
editor.getAttributes('link').href
```

### isActive()
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

### registerPlugin()
Register a ProseMirror plugin.

| Parameter      | Type                                               | Description                                               |
| -------------- | -------------------------------------------------- | --------------------------------------------------------- |
| plugin         | Plugin                                             | A ProseMirror plugin                                      |
| handlePlugins? | (newPlugin: Plugin, plugins: Plugin[]) => Plugin[] | Control how to merge the plugin into the existing plugins |

### setOptions()
Update editor options.

| Parameter | Type                   | Description       |
| --------- | ---------------------- | ----------------- |
| options   | Partial<EditorOptions> | A list of options |

```js
// Add a class to an existing editor instance
editor.setOptions({
  editorProps: {
    attributes: {
      class: 'my-custom-class',
    },
  },
})
```

### setEditable()
Update editable state of the editor.

| Parameter | Type    | Description                                                   |
| --------- | ------- | ------------------------------------------------------------- |
| editable  | boolean | `true` when the user should be able to write into the editor. |
| emitUpdate | boolean | Defaults to `true`. Determines whether `onUpdate` is triggered. |

```js
// Make the editor read-only
editor.setEditable(false)
```

### unregisterPlugin()
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

### isFocused
Check if the editor is focused.

```js
editor.isFocused
```

### isDestroyed
Check if the editor is destroyed.

```js
editor.isDestroyed
```

### isCapturingTransaction
Check if the editor is capturing a transaction.

```js
editor.isCapturingTransaction
```

## Settings

### element
The `element` specifies the HTML element the editor will be binded to. The following code will integrate Tiptap with an element with the `.element` class:

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

### extensions
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

### content
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

### editable
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

### autofocus
With `autofocus` you can force the cursor to jump in the editor on initialization.

| Value     | Description                                            |
| --------- | ------------------------------------------------------ |
| `'start'` | Sets the focus to the beginning of the document.       |
| `'end'`   | Sets the focus to the end of the document.             |
| `'all'`   | Selects the whole document.                            |
| `Number`  | Sets the focus to a specific position in the document. |
| `true`    | Enables autofocus.                                     |
| `false`   | Disables autofocus.                                    |
| `null`    | Disables autofocus.                                    |

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

### enableInputRules
By default, Tiptap enables all [input rules](/guide/custom-extensions/#input-rules). With `enableInputRules` you can control that.

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

Alternatively you can allow only specific input rules.

```js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: [
    StarterKit,
    Link,
  ],
  // pass an array of extensions or extension names
  // to allow only specific input rules
  enableInputRules: [Link, 'horizontalRule'],
})
```

### enablePasteRules
By default, Tiptap enables all [paste rules](/guide/custom-extensions/#paste-rules). With `enablePasteRules` you can control that.

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

Alternatively you can allow only specific paste rules.

```js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: [
    StarterKit,
    Link,
  ],
  // pass an array of extensions or extension names
  // to allow only specific paste rules
  enablePasteRules: [Link, 'horizontalRule'],
})
```

### injectCSS
By default, Tiptap injects [a little bit of CSS](https://github.com/ueberdosis/tiptap/tree/main/packages/core/src/style.ts). With `injectCSS` you can disable that.

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

### injectNonce
When you use a [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) with `nonce`, you can specify a `nonce` to be added to dynamically created elements. Here is an example:

```js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  extensions: [
    StarterKit,
  ],
  injectCSS: true,
  injectNonce: "your-nonce-here"
})
```

### editorProps
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

### parseOptions
Passed content is parsed by ProseMirror. To hook into the parsing, you can pass `parseOptions` which are then handled by [ProseMirror](https://prosemirror.net/docs/ref/#model.ParseOptions).

```js
new Editor({
  // Learn more: https://prosemirror.net/docs/ref/#model.ParseOptions
  parseOptions: {
    preserveWhitespace: 'full',
  },
})
```
