---
'@tiptap/react': minor
---

`useEditor` is now typed as returning `Editor | null` for every `immediatelyRender` value, matching what the hook already returns at runtime. Guard the result before using the editor, for example with `if (!editor) return null`.
