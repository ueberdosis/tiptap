---
'@tiptap/extension-link': minor
---

Typing or pasting Markdown link syntax like `[text](https://url)` now converts it into a link. URLs are validated through `isAllowedUri`, and the behavior can be disabled with the new `markdownLinks` option.
