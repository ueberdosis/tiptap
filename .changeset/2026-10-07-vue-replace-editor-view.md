---
'@tiptap/vue': patch
---

Fix `EditorContent` showing two editors when its `editor` is replaced, and destroy the editor that `useEditor` created first when `onMounted` runs twice, as it can during Nuxt hydration.
