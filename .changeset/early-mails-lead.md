---
"@tiptap/ai-toolkit": patch
---

Attributes with a `default` of `undefined` now stay optional in the Server AI Toolkit. Before, the server removed content that left them out, even on a read.
