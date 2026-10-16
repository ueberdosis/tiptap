---
'@tiptap/extension-bubble-menu': patch
'@tiptap/extension-floating-menu': patch
---

Fix bubble and floating menus that could show again after their plugin view was destroyed since
pending tasks still run for destroyed views.
