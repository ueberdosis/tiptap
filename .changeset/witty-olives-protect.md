---
"@tiptap/extension-link": patch
"tiptap-demos": patch
---

The link extension's `validate` option now applies to both auto-linking and XSS mitigation. While, the new `shouldAutoLink` option is used to disable auto linking on an otherwise valid url.
