# Upgrade Guide

## toc

## Reasons to upgrade to tiptap 2.x
Yes, it’s tedious work to upgrade your favorite text editor to a new API, but we made sure you’ve got enough reasons to upgrade to the newest version

* Autocompletion in your IDE (thanks to TypeScript)
* Amazing documentation with 100+ pages
* Active development, new features in the making
* Tons of new extensions planned
* Well-tested code base

## Upgrading from 1.x to 2.x
The new API will look pretty familiar too you, but there are a ton of changes though. To make the upgrade a little bit easier, here is everything you need to know:

### Upgrade to Vue.js 3
:::warning Work in progress
We’re waiting for Gridsome to be compatible with Vue.js 3.
:::

### Explicitly register the Document, Text and Paragraph extensions
tiptap 1 tried to hide a few required extensions from you with the default setting `useBuiltInExtensions: true`. That setting has been removed and you’re required to import all extensions. Be sure to explicitly import at least the [Document](/api/nodes/document), [Paragraph](/api/nodes/paragraph) and [Text](/api/nodes/text) extensions.

TODO: removed dropCursor, enableDropCursor, enableGapCursor

```js
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

new Editor({
  extensions: [
    Document,
    Paragraph,
    Text,
    // all your other extensions
  ]
})
```

### New document type
~~**We renamed the default `Document` type from `doc` to `document`.** To keep it like that, use your own implementation of the `Document` node or migrate the stored JSON to use the new name.~~

### Removed methods
TODO: state()

### New extension API
In case you’ve built some custom extensions for your project, you’re required to rewrite them to fit the new API. No worries, you can keep a lot of your work though. The `schema`, `commands`, `keys`, `inputRules` and `pasteRules` all work like they did before. It’s just different how you register them.

```js
import { Node } from '@tiptap/core'

const CustomExtension = Node.create({
  name: 'custom_extension'
  defaultOptions: {
    …
  },
  addAttributes() {
    …
  },
  parseHTML() {
    …
  },
  renderHTML({ node, HTMLAttributes }) {
    …
  },
  addCommands() {
    …
  },
  addKeyboardShortcuts() {
    …
  },
  addInputRules() {
    …
  },
  // and more …
})
```

Read more about [all the nifty details building custom extensions](/guide/build-extensions) in our guide.

### Renamed settings and methods
[We renamed a lot of settings and methods](/api/editor). Hopefully you can migrate to the new API with search & replace. Here is a list of what changed:

| Old name        | New name    |
| --------------- | ----------- |
| ~~`autoFocus`~~ | `autofocus` |

### Commands can be chained now
Most commands can be combined to one call now. That’s shorter than separate function calls in most cases. Here is an example to make the selected text bold:

```js
editor.chain().toggleBold().focus().run()
```

The `.chain()` is required to start a new chain and the `.run()` is needed to actually execute all the commands in between. Read more about [the new tiptap commands](/api/commands) in our API documentation.

### .focus() isn’t called on every command anymore
We tried to hide the `.focus()` command from you with tiptap 1 and executed that on every command. That led to issues in specific use cases, where you want to run a command, but don’t want to focus the editor.

With tiptap 2.x you have to explicitly call the `focus()` and you probably want to do that in a lot of places. Here is an example:

```js
editor.chain().focus().toggleBold().run()
```

### Collaborative editing
The reference implementation for collaborative editing uses Y.js now. That’s a whole different thing. You still can use the tiptap 1 extension, but it’s up to you to adapt it to the new extension API. If you’ve done this, don’t forget to share it with us so we can link to it from here!

Read more about [the new collaborative editing experience](/guide/collaborative-editing) in our guide.

### Become a sponsor
tiptap wouldn’t exist without the funding of its community. If you fell in love with tiptap, don’t forget to [become a sponsor](/sponsor) and make the maintenance, development and support sustainable.

In exchange, we’ll take you into our hearts, invite you to private repositories, add a `sponsor 💖` label to your issues and pull requests and more.
