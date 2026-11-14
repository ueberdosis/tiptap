---
'@tiptap/markdown': patch
---

Destroyed editors no longer stay in memory through tokenizers registered on the shared `marked` instance. Each Markdown manager now uses its own `marked` instance unless a custom one is provided.
