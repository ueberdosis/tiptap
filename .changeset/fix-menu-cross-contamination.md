---
'@tiptap/extension-bubble-menu': patch
'@tiptap/extension-floating-menu': patch
'@tiptap/react': patch
---

Fix `BubbleMenu`/`FloatingMenu` to use `pluginKey` as the transaction meta key so that multiple instances can be updated independently without affecting each other
