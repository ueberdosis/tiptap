---
'@tiptap/y-tiptap': patch
---

Registering a plugin in a collaborative editor no longer rebuilds the whole document. Before, the next undo or remote change re-created every node view after the changed position, which froze large documents.
