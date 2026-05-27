---
'@tiptap/server-ai-toolkit': patch
---

Exclude `toText` property when serializing the schema into a JSON object, because it is a function and functions are not serializable.
