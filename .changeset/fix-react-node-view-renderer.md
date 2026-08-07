---
"@tiptap/react": patch
---

Fix ReactNodeViewRenderer crash when contentComponent is not available

When a custom atom node uses ReactNodeViewRenderer and exists in the initial document,
the renderer could return an empty object if contentComponent wasn't available yet.
This caused ProseMirror to crash with "TypeError: dom.hasAttribute is not a function"
because it expected a valid NodeView with a dom property.

The fix returns a minimal valid NodeView with a placeholder DOM element instead of an empty object.
