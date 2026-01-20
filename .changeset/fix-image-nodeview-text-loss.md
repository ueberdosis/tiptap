---
"@tiptap/extension-image": patch
---

Fix: Prevent text loss when deleting an image node with `showCaption: false` in custom NodeView demo. Now, text typed before/after the image is correctly preserved in the document.
