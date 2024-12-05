---
"@tiptap/extension-text-style": minor
---

fix: #4311 - update the logic of removeEmptyTextStyle to manually handle the selection of all of the nodes within the selection to check for their marks independently to fix an issue where unsetting the font family on a selection would remove all applied text style marks from the selection as well
