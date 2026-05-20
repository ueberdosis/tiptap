---
'@tiptap/extension-drag-handle': patch
---

**DragHandle**: Added `dragImageProperties` option to limit which CSS properties are cloned for the drag image. By default all ~300+ computed styles are copied; setting this to a subset (e.g. `['color', 'background-color', 'font-size']`) reduces the cost when dragging selections with complex nodes.
