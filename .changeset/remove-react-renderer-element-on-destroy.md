---
"@tiptap/react": patch
---

Ensure `ReactRenderer.destroy()` removes the renderer DOM element when present.

- When consumers append a `ReactRenderer`'s `.element` to the DOM (for example many demos append it to `document.body`), previously calling `destroy()` removed the portal renderer but left the DOM node in place which could lead to accumulating `.react-renderer` elements.
- `destroy()` now also removes the element from its parent node if present, preventing leaked DOM nodes / React roots.
