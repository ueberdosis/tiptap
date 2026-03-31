---
'@tiptap/extension-bubble-menu': patch
---

Prevent hidden bubble menus from reappearing during scroll and resize updates. Bubble menu positioning now only runs for menus that are already shown, so default text-selection menus stay hidden until they should actually open.
