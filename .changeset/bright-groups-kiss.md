---
'@tiptap/react': patch
'@tiptap/vue-2': patch
---

Forward BubbleMenu and FloatingMenu HTML props to the actual menu element so attributes like `className`, `style`, `data-*`, and event handlers bind to the positioned menu container.
