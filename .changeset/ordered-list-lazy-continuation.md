---
"@tiptap/extension-list": patch
---

Treat non-indented continuation lines following an ordered list marker as part of the same list item.

This aligns ordered list parsing with CommonMark behavior: lines immediately after a list item (before a
blank line) are considered lazy continuation and remain inside the list item rather than ending it.

