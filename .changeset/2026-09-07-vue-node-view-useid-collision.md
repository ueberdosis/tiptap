---
'@tiptap/vue': patch
---

Fix Vue node views generating duplicate `useId()` values. Components using `useId()` inside a node view (directly, or via a child component/library relying on it for a unique DOM id) now get unique ids across node views instead of colliding.
