# Upgrade Guide

## Reasons to upgrade to tiptap 2.x
* autocomplete in your IDE (thanks to TypeScript)
* an amazing documentation with 100+ pages
* active development, new features in the making
* tons of new extensions planned
* well-tested code base

## Upgrading from 1.x to 2.x

The new API will look pretty familiar too you, but there are a ton of changes though. To make the upgrade a little bit easier, here is everything you need to know:

### 1. Explicitly register the Document, Text and Paragraph extensions

Tiptap 1 tried to hide a few required extensions from you with the default setting `useBuiltInExtensions: true`. Be sure to explicitly import the [Document](/api/extensions/document), [Paragraph](/api/extensions/paragraph) and [Text](/api/extensions/text) extensions.

```js
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

new Editor({
  extensions: [
      Document(),
      Paragraph(),
      Text(),
      …
  ]
})
```

The `useBuiltInExtensions` setting has been removed.

### 2. New document type
**We renamed the default `Document` type from `doc` to `document`.** To keep it like that, use your own implementation of the `Document` node or migrate the stored JSON to use the new name.

```js
import Document from '@tiptap/extension-document'
const CustomDocument = Document.name('doc').create()

new Editor({
  extensions: [
      CustomDocument(),
      …
  ]
})
```

### 3. New extension API

In case you’ve built some custom extensions for your project, you’ll need to rewrite them to fit the new API. No worries, though, you can keep a lot of your work though. The schema, commands, keys, inputRules, pasteRules all work like they did before. It’s just different how you register them.

```js
const CustomExtension = …
```

### 4. Blockquotes must not be nested anymore

:::warning Breaking Change
Currently, blockquotes must not be nested anymore. That said, we’re working on bringing it back. If you use nested blockquotes in your app, don’t upgrade yet.
:::

### 5. Renamed API methods

[We renamed a lot of commands](/api/commands), hopefully you can migrate to the new API with search & replace. Here is a list of what changed:

| Old method name | New method name |
| --------------- | --------------- |
| ~~`getHTML`~~   | `html`          |
| ~~`getJSON`~~   | `json`          |

### 6. .focus() isn’t called on every command anymore

We tried to hide the `.focus()` command from you with tiptap 1 and executed that on every other command. That led to issues in specific use cases, where you want to run a command, but don’t want to focus the editor. With tiptap 2.x you have to explicitly call the `focus()` and you probably want to do that in a lot of places. Here is an example:

```js
editor.focus().bold()
```
