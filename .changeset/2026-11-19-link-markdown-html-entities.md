---
'@tiptap/extension-link': patch
---

Markdown links now decode HTML5 entities in their destination, and write `&` back as `&amp;`, so URLs containing `&amp;` or a literal `&` survive a save-and-load round trip.
