---
'@tiptap/extension-image': patch
---

Add `allowPastedImages` option to the `Image` extension. When set to `false`, `<img>` tags contained in pasted HTML (e.g. copying a snippet of a web page) are stripped before insertion, while images inserted programmatically (for example via `setImage`) are unaffected. Defaults to `true`, matching the previous behavior. Fixes #4611.
