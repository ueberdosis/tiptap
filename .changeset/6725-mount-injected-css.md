---
"@tiptap/core": patch
---

Fix an issue where injected CSS was not mounted correctly when the editor instance was mounted. The fix ensures CSS injected by the editor is attached to the document when the editor mounts, preventing missing styles in some mount/unmount scenarios.
