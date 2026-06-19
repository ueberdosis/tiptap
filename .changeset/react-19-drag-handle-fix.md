---
"@tiptap/extension-drag-handle-react": patch
---

Fix React 19 strict mode compatibility by using useRef instead of useState for the portal element. Changing the `className` prop now updates the element in place without re-registering the drag handle plugin.
