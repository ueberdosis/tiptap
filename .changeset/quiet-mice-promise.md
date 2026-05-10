---
'@tiptap/react': patch
---

Batch React NodeView portal updates for each ProseMirror view update instead of triggering a separate `flushSync`-driven portal update for every NodeView.

This reduces React update churn during bulk NodeView creation, such as paste, `setContent`, or other transactions that insert many React-backed NodeViews at once, while preserving selection-sensitive NodeView behavior.
