---
'@tiptap/extension-floating-menu': patch
'@tiptap/extension-bubble-menu': patch
---

You can now pass a callback to the `appendTo` option in the floating and bubble menu
extensions. The callback can return an element or a Promise that resolves to an element,
so menus can be appended to elements that are created asynchronously.
