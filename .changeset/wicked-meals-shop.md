---
"@tiptap/core": patch
---

getMarkRange would greedily match more content than it should have if it was the same type of mark, now it will match only the mark at the position #3872
