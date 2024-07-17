---
"@tiptap/core": patch
---

There was a bug where doing a `.configure` on an extension, node or mark would overwrite the extensions options instead of being merged with the default options.
