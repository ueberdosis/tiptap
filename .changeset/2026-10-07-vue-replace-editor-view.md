---
'@tiptap/vue': patch
---

Destroy the editor that `useEditor` created first when `onMounted` runs twice on the same component, as it can during Nuxt hydration.
