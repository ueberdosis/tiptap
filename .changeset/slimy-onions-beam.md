---
'@tiptap/static-renderer': patch
---

Fix the static renderer ignoring `unhandledNode` and `unhandledMark` for node or mark types missing from the schema; such content now falls back to those renderers instead of throwing in `Node.fromJSON`
