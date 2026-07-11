---
'@tiptap/core': patch
---

Input rules no longer crash or replace the wrong content when the matched text spans an inline atom node (like a mention). Input rules match against a string where leaf nodes get expanded to placeholders like `%leaf%`, so a match crossing an atom ended up with a range that didn't map back to real document positions, throwing `RangeError: Position -N out of range` or corrupting nearby content. Such matches are now skipped. Rules on plain text, including text after an atom, behave the same as before.
