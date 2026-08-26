# @tiptap/codemod-v3-to-v4

Codemod workflows for migrating Tiptap projects from v3 to v4.

## Current migrations

- Renames `@tiptap/vue-3` to `@tiptap/vue`.
- Renames `@tiptap/extension-drag-handle-vue-3` to `@tiptap/extension-drag-handle-vue`.

## Local development

```bash
pnpm install
pnpm validate
pnpm test
pnpm exec codemod workflow run -w . -t /path/to/project --param vue_target_path=/path/to/project
```
