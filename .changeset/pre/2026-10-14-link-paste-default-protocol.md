---
'@tiptap/extension-link': patch
---

Pasting a link without a protocol now uses the `defaultProtocol` option instead of always falling back to `http`.
