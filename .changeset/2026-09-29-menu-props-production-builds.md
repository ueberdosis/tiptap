---
'@tiptap/react': patch
---

`BubbleMenu` and `FloatingMenu` forward `data-*`, `aria-*` and `style` props again in minified production builds. Some minifiers removed the code that applied them.
