---
'@tiptap/extension-list': minor
---

`ListKeymap`'s Backspace handler now lifts the current list item before merging. At the start of a non-first list item, the item is lifted out of its wrapping list (splitting the list around it) instead of immediately joining its content into the previous item. A second Backspace then hits the existing "paragraph after a list" branch and merges the lifted textblock's content into the previous list's last item. Mirrors the two-step behavior introduced for blockquote in #7891.
