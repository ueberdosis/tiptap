---
'@tiptap/core': patch
'@tiptap/markdown': patch
'@tiptap/extension-text': patch
---

Fix HTML character escaping in markdown roundtrip. HTML entities (`&lt;`, `&gt;`, `&amp;`) are now decoded to literal characters when parsing markdown into the editor, and re-encoded when serializing back to markdown. This enables correct display of angle brackets and ampersands in unfenced content while preserving literal characters inside code blocks and inline code.
