---
'@tiptap/extension-blockquote': patch
---

Fix a crash when pressing Backspace with the caret at the very start of the document, before a leading block node such as an image. The blockquote backspace handler assumed the caret always sat inside a block and threw `TypeError: Cannot read properties of undefined (reading 'type')` for a top-level gap cursor. It now bails out early when there is no enclosing block.
