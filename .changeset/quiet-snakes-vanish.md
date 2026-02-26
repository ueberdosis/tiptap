---
'@tiptap/starter-kit': major
---

**Breaking Change:** Removed dependencies on deprecated extensions. These extensions are now consolidated in `@tiptap/extensions`.

- Removed `@tiptap/extension-dropcursor` – use `DropCursor` from `@tiptap/extensions`
- Removed `@tiptap/extension-gapcursor` – use `GapCursor` from `@tiptap/extensions`
- Removed `@tiptap/extension-list-item` – use `ListItem` from `@tiptap/extension-list`
- Removed `@tiptap/extension-list-keymap` – use `ListKeymap` from `@tiptap/extension-list`

All functionality is available through `@tiptap/extensions` and `@tiptap/extension-list`, which are already included as dependencies.
