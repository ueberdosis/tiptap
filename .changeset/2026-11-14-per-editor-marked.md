---
'@tiptap/markdown': major
---

Destroyed editors no longer stay in memory through tokenizers registered on the shared `marked` instance. Each Markdown manager now uses its own `Marked` instance unless one is passed through the `marked` option. `markedOptions` now applies only to that instance, not to the shared `marked`.

`editor.markdown.instance` now returns a `Marked` instance by default. It is not callable and has no `getDefaults()`, so use `instance.parse(src)` instead of `instance(src)`.

Calls to `marked.use()` or `marked.setOptions()` on the shared `marked` export no longer reach editors. Make those calls on a `new Marked()` for each editor, and pass it through the `marked` option. Passing the shared `marked` export keeps the old behavior, including the leak.
