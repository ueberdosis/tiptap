---
'@tiptap/extension-code-block': patch
---

Fixed a bug where pressing `ArrowUp` in a code block that is the first node in the document did nothing, leaving no way to insert content above it. A new default block is now inserted above the code block, mirroring the existing `ArrowDown` behavior. The behavior can be disabled via the new `exitOnArrowUp` option.
