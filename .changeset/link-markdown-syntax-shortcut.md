---
'@tiptap/extension-link': minor
---

Typing or pasting the Markdown link syntax, e.g. `[text](https://url)` or `[text](https://url "title")`, now converts it into a link. URLs are validated through the existing `isAllowedUri` option, the Markdown image syntax and code spans are left untouched, and the behavior can be disabled with the new `markdownLinks` option.
