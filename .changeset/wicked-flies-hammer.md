---
'@tiptap/extension-floating-menu': patch
'@tiptap/extension-bubble-menu': patch
---

You can now pass a callback to the `appendTo` option in the floating and bubble menu
extensions. The callback must return an element synchronously,
so menus can be appended to elements that are created dynamically.
