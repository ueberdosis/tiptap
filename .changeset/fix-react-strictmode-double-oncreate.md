---
'@tiptap/react': patch
---

Fix `useEditor` firing `onCreate` twice for two different `Editor` instances under React StrictMode. StrictMode invokes the hook's internal lazy initializer twice, and both calls used to construct and auto-mount a real `Editor`; the discarded instance is now destroyed synchronously, before its `create` event has a chance to fire.
