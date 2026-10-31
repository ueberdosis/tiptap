---
'@tiptap/html': patch
---

`@tiptap/html` accepts happy-dom 21.0.4 and later as a peer dependency, so installs that use happy-dom 21 no longer fail with ERESOLVE and can pick up the fix for GHSA-834v-8h66-3h79 (every happy-dom release up to 21.0.3 is affected).
