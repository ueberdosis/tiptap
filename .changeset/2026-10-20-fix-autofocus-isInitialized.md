---
'@tiptap/core': patch
---

Fix `editor.isInitialized` staying `false` when autofocus throws on mount, for example from a transaction mismatch in some browsers. The editor now still emits `create` and reports as initialized in that case.
