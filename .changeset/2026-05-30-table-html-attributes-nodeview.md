---
'@tiptap/extension-table': patch
---

Fix `HTMLAttributes` not being applied to the `<table>` element when `resizable` is disabled (the default). The `TableView` node view (introduced in 3.23) bypassed `renderHTML` and never applied user-configured attributes like `class` or `data-*` to the rendered table element.
