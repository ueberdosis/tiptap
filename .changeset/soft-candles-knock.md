---
'@tiptap/core': minor
---

Add an optional `createCustomHandle(direction, className)` callback to `ResizableNodeView` to let consumers render fully customized resize handles (markup, classes, styles, positioning). When provided, the default `positionHandle()` is skipped for that handle. Existing behavior is unchanged if the callback is not supplied.
