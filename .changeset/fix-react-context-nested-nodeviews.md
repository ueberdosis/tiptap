---
"@tiptap/react": minor
---

Fix React Context propagation in nested NodeViews by implementing hierarchical portal rendering. React Context now correctly flows from parent NodeViews to child NodeViews, enabling the use of UI libraries that rely on context (Material-UI, Chakra UI, etc.) in custom nodes and marks.
