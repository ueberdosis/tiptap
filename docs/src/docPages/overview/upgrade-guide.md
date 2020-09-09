# Upgrade Guide

## Reasons to upgrade to tiptap 2.x

* TypeScript: auto complete, less bugs, generated API documentation
* Amazing documentation with 100+ pages
* Active maintenance, no more updates to 1.x
* Tons of new extensions planned
* Less bugs, tested code based

## Upgrading from 1.x to 2.x
The new API will look pretty familiar too you, but there are a ton of changes though. To make the upgrade a little bit easier, here is everything you should do:

### New document type
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

### New extension API

In case you’ve built some custom extensions for your project, you’ll need to rewrite them to fit the new API. No worries, though, you can keep a lot of your work though. The schema, commands, keys, inputRules, pasteRules all work like they did before. It’s just different how you register them.

```js
const CustomExtension = …
```