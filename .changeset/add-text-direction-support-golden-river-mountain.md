---
"@tiptap/core": minor
---

Add native text direction support for RTL and bidirectional content. The editor now includes a `textDirection` option that can be set to `'ltr'`, `'rtl'`, or `'auto'` to control the direction of all content globally. Additionally, new `setTextDirection` and `unsetTextDirection` commands allow for granular control of text direction on specific nodes. This enables proper rendering of right-to-left languages like Arabic and Hebrew, as well as bidirectional text mixing multiple languages.
