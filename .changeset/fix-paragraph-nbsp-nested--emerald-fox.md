---
"@tiptap/core": patch
"@tiptap/extension-blockquote": patch
"@tiptap/extension-list": patch
"@tiptap/extension-paragraph": patch
"@tiptap/markdown": patch
---

Improved markdown empty-paragraph roundtripping across top-level and nested block content. Empty paragraphs now serialize with natural blank-line spacing for the first paragraph in a run and `&nbsp;` markers for subsequent empty paragraphs at the same level, while parsing preserves those empty paragraphs when converting markdown back to JSON.
