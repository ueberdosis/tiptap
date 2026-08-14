---
'@tiptap/markdown': patch
---

Isolate the `marked` instance per editor so options and custom tokenizers no longer leak across editors. The `marked` option now also accepts a `Marked` instance.
