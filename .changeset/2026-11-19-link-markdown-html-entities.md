---
'@tiptap/extension-link': patch
---

Markdown links now decode HTML5 entities in their destination, both when parsed and when typed or pasted with `markdownLinks`, and write `&`, `(` and `)` back as character references. URLs containing `&amp;` or balanced parentheses now survive a save-and-load round trip.
