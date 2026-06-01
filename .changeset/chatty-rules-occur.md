---
'@tiptap/static-renderer': patch
---

Fix the types of the JSON static renderers (`renderJSONContentToReactElement` and `renderJSONContentToString`): you can now pass `JSONContent` directly and read node fields like `node.text` in your mappings without type errors or casts.
