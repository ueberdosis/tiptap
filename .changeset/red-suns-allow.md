---
"@tiptap/react": patch
---

Resolve a bug an editor could be instantiated but not destroyed. This was causing issues with multiple instances of plugins still being active and interfering with each other
