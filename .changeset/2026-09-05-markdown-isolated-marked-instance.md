---
'@tiptap/markdown': minor
---

Each editor now parses markdown with its own `marked` instance. Editors previously shared the global one, so mounting a second editor could change how the first one parsed and, when the two had different extensions, silently drop content. Markdown parsing also no longer slows down as more editors are created.

The `marked` option now accepts a `new Marked()` instance without a cast. If you relied on configuring the global `marked` export and having Tiptap pick it up, pass it explicitly: `Markdown.configure({ marked })`.
