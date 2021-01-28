# Editor

## toc

## Introduction
This class is a central building block of tiptap. It does most of the heavy lifting of creating a working  [ProseMirror](https://ProseMirror.net/) editor such as creating the [`EditorView`](https://ProseMirror.net/docs/ref/#view.EditorView), setting the initial [`EditorState`](https://ProseMirror.net/docs/ref/#state.Editor_State) and so on.

## List of available settings
Check out the API documentation to see [all available options](/api/editor/).

### Element
The `element` specifies the HTML element the editor will be binded too. The following code will integrate tiptap with an element with the `.element` class:

```js
import { Editor } from '@tiptap/core'
import { defaultExtensions } from '@tiptap/starter-kit'

new Editor({
  element: document.querySelector('.element'),
  extensions: defaultExtensions(),
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
import { defaultExtensions } from '@tiptap/starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Highlight from '@tiptap/extension-highlight'

new Editor({
  // Use the default extensions
  extensions: defaultExtensions(),

  // … or use specific extensions
  extensions: [
    Document,
    Paragraph,
    Text,
  ],

  // … or both
  extensions: [
    ...defaultExtensions(),
    Highlight,
  ],
})
```

### Content
With the `content` property you can provide the initial content for the editor. This can be HTML or JSON.

```js
import { Editor } from '@tiptap/core'
import { defaultExtensions } from '@tiptap/starter-kit'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: defaultExtensions(),
})
```

### Editable
The `editable` property determines if users can write into the editor.

```js
import { Editor } from '@tiptap/core'
import { defaultExtensions } from '@tiptap/starter-kit'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: defaultExtensions(),
  editable: false,
})
```

### Autofocus
With `autofocus` you can force the cursor to jump in the editor on initialization.

```js
import { Editor } from '@tiptap/core'
import { defaultExtensions } from '@tiptap/starter-kit'

new Editor({
  extensions: defaultExtensions(),
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
By default, tiptap enables all [input rules](/guide/build-extensions/#input-rules). With `enableInputRules` you can disable that.

```js
import { Editor } from '@tiptap/core'
import { defaultExtensions } from '@tiptap/starter-kit'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: defaultExtensions(),
  enableInputRules: false,
})
```

### Enable paste rules
By default, tiptap enables all [paste rules](/guide/build-extensions/#paste-rules). With `enablePasteRules` you can disable that.

```js
import { Editor } from '@tiptap/core'
import { defaultExtensions } from '@tiptap/starter-kit'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: defaultExtensions(),
  enablePasteRules: false,
})
```

### Inject CSS
By default, tiptap injects [a little bit of CSS](https://github.com/ueberdosis/tiptap-next/tree/main/packages/core/src/style.ts). With `injectCSS` you can disable that.

```js
import { Editor } from '@tiptap/core'
import { defaultExtensions } from '@tiptap/starter-kit'

new Editor({
  extensions: defaultExtensions(),
  injectCSS: false,
})
```

<!--
| Setting            | Type            | Default  | Description                                                                                                                                          |
| ------------------ | --------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `autofocus`        | `Boolean`       | `false`  | Focus the editor on init.                                                                                                                            |
| `content`          | `Object|String` | `null`   | The editor state object used by Prosemirror. You can also pass HTML to the `content` slot. When used both, the `content` slot will be ignored.       |
| `editable`         | `Boolean`       | `true`   | When set to `false` the editor is read-only.                                                                                                         |
| ~~`editorProps`~~  | ~~`Object`~~    | ~~`{}`~~ | ~~A list of [Prosemirror editorProps](https://prosemirror.net/docs/ref/#view.EditorProps).~~                                                         |
| `element`          | `Element`       | `false`  | Focus the editor on init.                                                                                                                            |
| `extensions`       | `Array`         | `[]`     | A list of extensions you would like to use. Can be [`Nodes`](/api/nodes), [`Marks`](/api/marks) or [`Extensions`](/api/extensions).                  |
| `injectCSS`        | `Boolean`       | `true`   | When set to `false` tiptap won’t load [the default ProseMirror CSS](https://github.com/ueberdosis/tiptap-next/tree/main/packages/core/src/style.ts). |
| ~~`parseOptions`~~ | ~~`Object`~~    | ~~`{}`~~ | ~~A list of [Prosemirror parseOptions](https://prosemirror.net/docs/ref/#model.ParseOptions).~~                                                      | --> |

## List of available methods
An editor instance will provide the following public methods. They’ll help you to work with the editor.

Don’t confuse methods with [commands](/api/commands), which are used to change the state of editor (content, selection, and so on) and only return `true` or `false`.

| Method                | Parameters                                                                                                  | Description                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `can()`               | -                                                                                                           | Check if a command or a command chain can be executed. Without executing it. |
| `chain()`             | -                                                                                                           | Create a command chain to call multiple commands at once.                    |
| `createDocument()`    | `content` EditorContent<br>`parseOptions`                                                                   | Creates a ProseMirror document.                                              |
| `destroy()`           | –                                                                                                           | Stops the editor instance and unbinds all events.                            |
| `getHTML()`           | –                                                                                                           | Returns the current content as HTML.                                         |
| `getJSON()`           | –                                                                                                           | Returns the current content as JSON.                                         |
| `getMarkAttributes()` | `name` Name of the mark                                                                                     | Get attributes of the currently selected mark.                               |
| `getNodeAttributes()` | `name` Name of the node                                                                                     | Get attributes of the currently selected node.                               |
| `isActive()`          | `name` Name of the node or mark<br>`attrs` Attributes of the node or mark                                   | Returns if the currently selected node or mark is active.                    |
| `isEditable()`        | -                                                                                                           | Returns whether the editor is editable.                                      |
| `isEmpty()`           | -                                                                                                           | Check if there is no content.                                                |
| `getCharacterCount()` | -                                                                                                           | Get the number of characters for the current document.                       |
| `registerCommand()`   | `name` The name of your command<br>`callback` The method of your command                                    | Register a command.                                                          |
| `registerCommands()`  | `commands` A list of commands                                                                               | Register a list of commands.                                                 |
| `registerPlugin()`    | `plugin` A ProseMirror plugin<br>`handlePlugins` Control how to merge the plugin into the existing plugins. | Register a ProseMirror plugin.                                               |
| `setOptions()`        | `options` A list of options                                                                                 | Update editor options.                                                       |
| `unregisterPlugin()`  | `name` The plugins name                                                                                     | Unregister a ProseMirror plugin.                                             |
