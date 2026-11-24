---
'@tiptap/core': major
'@tiptap/react': major
'@tiptap/vue': major
---

Keep unmounted editors alive and build React and Vue NodeViews once per mount. Unmounting preserves the document, selection, and plugins. Autofocus runs only on the first mount. Repeated mounts at the same element and repeated unmounts do nothing. Destroyed editors cannot mount again.

Migration: use `editor.isMounted` before reading view DOM. `editor.isDestroyed` is true only after `destroy()`. React `useEditor` and Vue `Editor` now wait for `EditorContent` to mount the view by default. For a view without `EditorContent`, pass an `element` or call `editor.mount(element)`. Use `unmount()` for temporary removal and `destroy()` for final cleanup. Mount and unmount events now follow `EditorContent` attachment and removal.
