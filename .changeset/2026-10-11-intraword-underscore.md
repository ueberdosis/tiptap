---
'@tiptap/markdown': patch
---

Serializing to Markdown no longer adds a backslash to an underscore between two letters or digits, such as `@olivia_rhye` or `snake_case`, since CommonMark never reads it as emphasis.
