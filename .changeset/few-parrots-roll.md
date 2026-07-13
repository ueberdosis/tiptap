---
'@tiptap/extensions': patch
---

Fixed the `Selection` extension leaving the native browser selection visible on blur, where it overlapped the selection decoration. The native selection is now cleared on blur and restored on focus.
