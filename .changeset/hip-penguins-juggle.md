---
"@tiptap/core": patch
"@tiptap/react": patch
"@tiptap/vue-2": patch
"@tiptap/vue-3": patch
---

fix(nodeview): reduce unnecessary NodeView re-renders on unrelated transactions

React and Vue NodeViews no longer re-render when the editor creates new
decoration objects for an unrelated transaction. Added a shallow prop
comparison in ReactRenderer.updateProps() to skip portal updates when
props are unchanged.
