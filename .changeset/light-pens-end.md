---
"@tiptap/extension-ordered-list": patch
"@tiptap/extension-bullet-list": patch
---

This resolves an issue where the bullet-list and ordered-list extensions were depending on the list-item and text-style extensions unneccesarily. They are no longer imported and constants are used instead.
