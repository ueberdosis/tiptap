---
'@tiptap/extension-mention': patch
'@tiptap/core': patch
---

Add 'mentionSuggestionChar' to allowedAttributes for Markdown serialization in multi-mention setups. The attribute is only serialized when it differs from the default '@' character, keeping markdown output clean for single-mention users.
