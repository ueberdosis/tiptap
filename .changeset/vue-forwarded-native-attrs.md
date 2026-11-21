---
'@tiptap/vue': patch
---

`EditorContent` accepts native HTML attributes such as `contenteditable` and `aria-*`. `NodeViewWrapper` infers tag-specific attributes from `as` via Vue's `NativeElements` map.
