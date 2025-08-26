---
'@tiptap/extension-collaboration': patch
---

- The code is checking for UndoRedo, but the warning message still talks about History (outdated).
- The fix is just to update the string so it correctly warns about UndoRedo.
