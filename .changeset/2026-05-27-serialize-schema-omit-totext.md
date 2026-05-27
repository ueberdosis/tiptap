---
'@tiptap/server-ai-toolkit': patch
---

Exclude `toText` from serialized node specs in schema awareness so schema serialization remains JSON-safe when node specs define text extraction callbacks.
