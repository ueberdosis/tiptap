---
"@tiptap/core": patch
---

This plugs a memory leak where there is a circular reference between the view's DOM node and the editor instance, to resolve this, before destroying the view we need to delete the reference to the editor instance on the DOM node #5654
