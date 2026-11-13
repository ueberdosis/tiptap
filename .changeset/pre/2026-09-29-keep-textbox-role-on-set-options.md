---
'@tiptap/core': patch
---

The editor element keeps `role="textbox"` after `setOptions()` when `editorProps.attributes` is set. Before, a re-render in React replaced the default role with the user attributes. Attributes passed as a function now get the default role as well.
