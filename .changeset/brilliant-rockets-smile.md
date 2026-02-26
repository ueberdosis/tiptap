---
'@tiptap/vue': major
'@tiptap/extension-drag-handle-vue-3': major
---

**Breaking Change:** `@tiptap/vue-3` has been renamed to `@tiptap/vue`. With Vue 2 support removed, the version suffix is no longer necessary.

### Migration Guide

If you're currently using `@tiptap/vue-3`, update your imports:

```diff
- import { EditorContent } from '@tiptap/vue-3'
+ import { EditorContent } from '@tiptap/vue'
```

Update your `package.json` dependencies:

```diff
- "@tiptap/vue-3": "^3.20.0"
+ "@tiptap/vue": "^4.0.0"
```

The functionality remains the same—this is purely a naming change to reflect that Vue is now the standard Vue binding for Tiptap.
