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

## Publish

Run these commands from this directory:

```bash
pnpm exec codemod login
pnpm validate
pnpm test
pnpm exec codemod publish
```

## Verify the published workflow

Run the published workflow against a disposable project before documenting it in a release:

```bash
npx codemod@latest @tiptap/codemod-v3-to-v4 \
  --target /path/to/project \
  --param vue_target_path=/path/to/project
```
