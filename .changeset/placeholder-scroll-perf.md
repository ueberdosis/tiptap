---
'@tiptap/extensions': patch
---

Fix placeholder flickering during collaborative editing and reduce scroll-time CPU usage by deferring viewport recomputation to rAF, adding an overscan margin, and throttling scroll updates
