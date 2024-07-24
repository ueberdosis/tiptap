---
"@tiptap/core": patch
---

This fixes a bug with the placeholder extension where a heading level other than the default was not considered empty, when comparing node contents, we need to consider that the node attributes are carried over for a fair comparison of content instead of attribute values
