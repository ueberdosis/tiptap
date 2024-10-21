---
"@tiptap/extension-collaboration": minor
---

When collaborating on a document, a client may send changes which are invalid to the current client. This change makes it so that the client can be disabled from synchronizing any further changes to avoid the default behavior of stripping unknown content. This would allow the other client to continue editing on the document while still synchronizing any known changes.
