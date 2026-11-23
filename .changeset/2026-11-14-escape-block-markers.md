---
'@tiptap/core': patch
'@tiptap/extension-heading': patch
'@tiptap/extension-link': patch
'@tiptap/extension-paragraph': patch
---

Text that starts with a block marker (`1.`, `-`, `#`, `---`) or ends a heading with `#` now survives a Markdown export and re-import unchanged, instead of turning into a list, heading, or rule. Link titles with a line break keep their text as well.
