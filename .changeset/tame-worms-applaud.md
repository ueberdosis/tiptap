---
"@tiptap/core": patch
---

If a transaction results in the exact same editor state (either filtered out or failed to apply) then do not attempt to re-apply the same editor state and do not emit any events associated to the transaction
