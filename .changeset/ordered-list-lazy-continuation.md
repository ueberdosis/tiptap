---
"@tiptap/extension-list": patch
---

Preserve lazy continuation lines in ordered lists per CommonMark §5.3.

Non-indented continuation lines that appear immediately after a list item marker (and before a blank line)
are now treated as part of the current list item instead of terminating the list. Adds a focused regression
test (markdown) that enables `marked`'s `breaks: true` option to ensure inline hard-breaks are preserved.

Fixes: #7677
