---
"@tiptap/extension-drag-handle": patch
---

Fix the drag handle when the editor renders zero-size widget decorations, such as the page chrome injected by the Pages extension. The handle now resolves to the correct block instead of failing to position or aligning to a decoration, and it stays above positioned page chrome so it remains clickable.
