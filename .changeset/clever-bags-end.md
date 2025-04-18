---
'@tiptap/core': minor
---

The editor instance now supports an `unmount` method which allows for mounting and unmounting the editor to the DOM. This encourages re-use of editor instances by preserving all the same options between instances. This is different from the `destroy` method, which will unmount, emit the `destroy` event, and remove all event listeners.
