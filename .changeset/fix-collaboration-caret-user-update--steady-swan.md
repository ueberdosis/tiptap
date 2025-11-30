---
"@tiptap/extension-collaboration-caret": patch
---

Avoid mutating `this.options` in the `updateUser` command. `this.options` can be a getter and is not writable; the command now updates the provider awareness directly so user updates are applied correctly.
