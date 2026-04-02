---
'@tiptap/react': patch
---

Fix flushSync error when remounting useEditor with ReactNodeViewRenderer in React 19

When React 19 remounts components during a list reorder, ReactRenderer's flushSync call could fire during React's commit phase, causing a hard error. The flushSync is now wrapped in a try-catch that falls back to queueMicrotask when React prevents synchronous flushing.
