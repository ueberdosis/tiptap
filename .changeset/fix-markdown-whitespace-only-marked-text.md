---
'@tiptap/markdown': patch
---

Fix `serialize()` emitting empty delimiter runs (`a**** b`) for a whitespace-only text node that carries a mark. Such a node now serializes as plain whitespace, since `****` is not emphasis in CommonMark.
