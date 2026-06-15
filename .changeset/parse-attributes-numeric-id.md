---
'@tiptap/core': patch
---

Fix `parseAttributes` stripping Pandoc-style IDs that start with a number.

IDs such as `#2123` or `#5hello` were silently dropped because the ID matcher required a leading letter. The first character is now matched against `\w`, so numeric-leading IDs (valid in HTML5) are preserved. Example: `parseAttributes('#2123 .foo')` now returns `{ id: '2123', class: 'foo' }`. Class parsing is unchanged.
