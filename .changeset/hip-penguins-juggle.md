---
"@tiptap/core": patch
"@tiptap/react": patch
"@tiptap/vue-2": patch
"@tiptap/vue-3": patch
---

fix(nodeview): eliminate unnecessary re-renders, add opt-in position tracking

NodeViews no longer re-render when decorations or position change without
content changes. Added `trackNodeViewPosition` option — when enabled, the
component re-renders on every position shift so calls to `getPos()` stay
current in render output. Removed the internal `nodeViewPositionRegistry`.
Added shallow prop comparison in `ReactRenderer.updateProps()`.
