---
'@tiptap/extension-bubble-menu': patch
---

Fix a `TypeError` thrown by bubble menus when the selected node has no DOM, for example when the editor unmounts over a node selection
