---
'@tiptap/extension-code': patch
---

Fixed a bug where typing a character before an inline code markdown shortcut (e.g. `a` followed by backtick-delimited code) would delete the preceding character. The preceding character is now preserved.
