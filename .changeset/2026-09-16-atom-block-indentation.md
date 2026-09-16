---
'@tiptap/core': patch
---

Atom block directives (`:::name {…} :::`) indented by up to 3 spaces are now tokenized, matching how CommonMark treats indentation before block constructs. Previously an indented directive fell through to paragraph text, where autolinking and the next serialization permanently corrupted its attributes.
