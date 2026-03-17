---
'@tiptap/core': patch
'@tiptap/markdown': patch
---

Fix HTML character escaping in markdown roundtrip. HTML entities (`&lt;`, `&gt;`, `&amp;`, `&quot;`) are now decoded to literal characters when parsing markdown into the editor. `<`, `>`, and `&` are re-encoded when serializing back to markdown, while `"` is preserved as a literal character since double quotes are ordinary in markdown. Code detection for skipping encoding now uses the `code: true` extension spec instead of hardcoded type names. Literal characters inside code blocks and inline code are always preserved.
