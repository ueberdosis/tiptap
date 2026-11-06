---
'@tiptap/extension-code-block': patch
'@tiptap/markdown': patch
---

Parse fenced code blocks indented by 1-3 spaces in Markdown instead of dropping them, remove up to the fence's indentation from each content line as CommonMark requires, and keep the trailing blank lines of an unclosed fence as code content.
