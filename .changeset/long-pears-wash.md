---
"@tiptap/react": patch
---

This changes useEditorState to use the useLayoutEffect hook instead of the useEffect hook, so that state that might render to the page can be committed in one pass instead of two.
