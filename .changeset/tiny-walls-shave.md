---
"@tiptap/core": patch
---

Fixes a bug where if `enableContentCheck` was true, inserting content as JSON nodes would fail. This was because the node that was being created technically had a different schema than the content being inserted, so it would fail to generate the correct content value
