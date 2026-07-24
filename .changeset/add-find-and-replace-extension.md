---
'@tiptap/extension-find-and-replace': minor
---

Added a new `@tiptap/extension-find-and-replace` extension. It searches the document for a term, highlights all matches with decorations, and replaces the current or all matches. Supports case-sensitive, whole-word, and RE2-compatible regex search, plus commands to jump between results. Regex search avoids catastrophic backtracking but does not support lookarounds or backreferences.
