---
"@tiptap/core": patch
"@tiptap/extension-list": patch
"@tiptap/markdown": patch
---

Fix markdown parsing for bullet list items whose text looks like an ordered-list marker, such as `- 123.`, so extraction no longer loses the item content.
