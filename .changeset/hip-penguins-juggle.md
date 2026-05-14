---
"@tiptap/core": patch
"@tiptap/react": patch
"@tiptap/vue-2": patch
"@tiptap/vue-3": patch
---

fix(nodeview): eliminate unnecessary re-renders, add opt-in position tracking

NodeViews no longer re-render when decorations or the document position change
without the node's content changing. Added `trackNodeViewPosition` option to
opt into reactive `position` prop updates (at the cost of re-rendering on every
position shift). Removed the internal `nodeViewPositionRegistry`. Added shallow
prop comparison in `ReactRenderer.updateProps()`.
