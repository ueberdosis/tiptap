---
'@tiptap/starter-kit': major
---

We have now added the `Link`, `ListKeymap`, and `Underline` extensions to the starter kit for a smoother onboarding experience

If you have theses extensions in your project, you can remove them from your project and use the ones from the starter kit instead.

```diff
- import Link from '@tiptap/extension-link'
- import ListKeymap from '@tiptap/extension-list-keymap'
- import Underline from '@tiptap/extension-underline'
+ import { StarterKit } from '@tiptap/starter-kit'
```
