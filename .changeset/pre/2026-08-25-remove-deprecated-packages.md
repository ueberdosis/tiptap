---
'@tiptap/starter-kit': major
---

StarterKit no longer installs the deprecated `@tiptap/extension-dropcursor`, `@tiptap/extension-gapcursor`, `@tiptap/extension-list-item`, and `@tiptap/extension-list-keymap` packages. We will not publish further updates to these packages. StarterKit still includes their extensions, so you do not need to change your configuration.

If you import these extensions directly, switch to the new packages: `Dropcursor` and `Gapcursor` from `@tiptap/extensions`, and `ListItem` and `ListKeymap` from `@tiptap/extension-list`.
