---
'@tiptap/extension-details': minor
---

Added the `openWithoutDelay` option. With it, a Details created open shows its content as soon as it is drawn, instead of one tick later, so code that measures right after drawing reads the full height. It is off by default and only has an effect together with `persist`.
