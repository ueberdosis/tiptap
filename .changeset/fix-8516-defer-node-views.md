---
'@tiptap/core': patch
'@tiptap/react': patch
'@tiptap/vue': patch
---

Add `deferNodeViews` so React/Vue `EditorContent` can install node views once after the portal host exists, instead of building every node view twice on mount.
