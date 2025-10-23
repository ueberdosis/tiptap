---
"@tiptap/core": patch
---

Remove internal newline-only whitespace stripping from `elementFromString`.

This changes the DOM parsed from HTML strings: newline-only text nodes that were previously removed are now preserved. If your code relied on the old behavior, trim or strip whitespace nodes after calling `elementFromString` (e.g. remove text nodes where `!\S`.test(node.nodeValue)).

If you use `insertContent` to add parsed HTML to an editor, consider using the `preserveWhitespace` option to keep whitespace behavior consistent:

```js
editor.commands.insertContent(dom, { preserveWhitespace: false }) // or true if you want to keep all whitespace
```
