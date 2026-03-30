---
'@tiptap/core': patch
---

extendMarkRange defaults to using the attributes of the first mark of the given type, instead of `attributes = {}`. In particular, `extendMarkRange('link')` no longer extends to adjacent links with different hrefs; restore the previous behavior with `extendMarkRange('link', {})`.
