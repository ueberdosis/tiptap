---
'@tiptap/extension-collaboration-caret': patch
---

Fixed a bug which allowed potentially unsafe color values being sent by other clients. Those unsafe colors received from collaboration users are now ignored.
