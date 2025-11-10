---
'@tiptap/extension-unique-id': patch
'@tiptap/extensions': patch
---

Fixed infinite transaction loop that caused browser tabs to freeze when using UniqueID and TrailingNode extensions together.
