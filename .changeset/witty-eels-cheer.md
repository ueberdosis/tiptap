---
'@tiptap/core': major
---

`editor.storage` is instantiated per editor rather than per extension.

Previously, the storage value was a singleton per extension instance, this caused strange bugs when using multiple editor instances on a single page.

Now, storage instances are _per editor instance_, so changing the value on one `editor.storage` instance will not affect another editor's value.
