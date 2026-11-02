---
'@tiptap/extension-unique-id': patch
---

Count IDs once per changed range in UniqueID `appendTransaction` instead of calling `findDuplicates` for every new node (O(n²) on large pastes/tables).
