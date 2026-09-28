---
'@tiptap/react': patch
---

`useEditor` no longer destroys the editor before the component mounts when React delays the first commit, for example in a `React.lazy` component inside `Suspense`. Effects now get a working editor on their first run.
