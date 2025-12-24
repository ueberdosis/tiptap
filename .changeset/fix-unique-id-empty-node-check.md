---
"@tiptap/extension-unique-id": patch
---

Fix unique ID assignment when handling empty nodes by checking next node's attribute state in the transaction document before modifying it, preventing incorrect ID assignments.
