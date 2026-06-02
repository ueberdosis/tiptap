---
'@tiptap/extensions': patch
'tiptap-demos': patch
---

Fix the `Selection` extension highlighting beyond the selected text on multi-line selections: the native browser selection is now hidden while the editor is blurred, so only the styled `.selection` decoration is shown.
