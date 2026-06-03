---
'@tiptap/core': patch
---

`parseAttributes` no longer silently strips ids and classes that start with a number (e.g. `#2123` or `.2xl`). HTML5 allows ids to start with any non-whitespace character, so Pandoc-style attribute strings like `{#2123 .foo}` now parse to `{ id: '2123', class: 'foo' }` instead of dropping the id.
