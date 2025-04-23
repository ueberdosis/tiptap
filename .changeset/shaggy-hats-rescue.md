---
'@tiptap/react': patch
---

Fixed a bug in the EditorContent component that caused a crash in Firefox based browsers because of the editor view not being available when an uninitialized editor is unmounted (for example via Strict mode)
