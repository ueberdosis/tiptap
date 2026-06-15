---
'@tiptap/markdown': patch
---

Fix parsing with injected Marked instances so custom markdown tokenizers registered via `marked.use(...)` are respected.
