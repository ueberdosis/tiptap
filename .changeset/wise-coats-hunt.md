---
'@tiptap/react': patch
---

Improved the BubbleMenu's usability by ensuring the `appendTo` prop passed to the React BubbleMenu component is now correctly forwarded to the underlying bubble menu plugin. This fix allows developers to customize where the BubbleMenu is attached in the DOM, helping resolve issues with positioning and portal setups in React apps.
