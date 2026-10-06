# Setup and packages

## General

- For a new install, use the latest stable version. Resolve it with `npm view @tiptap/core version`.
- The editor and extension packages published from the tiptap monorepo share one version line. Pin
  every one of them to that same version. Mixing versions risks introducing bugs.
- Some packages have their own version line. Resolve these from the registry, never from
  `@tiptap/core`: `@tiptap/ai-toolkit`, `@tiptap/y-tiptap`, `@tiptap-pro/*` (private registry),
  `@hocuspocus/*`.
- Do not mix majors. For a project still on Tiptap 2, upgrade first. See
  https://tiptap.dev/docs/guides/upgrade-tiptap-v2.md.
- When integrating Tiptap for the first time, read the corresponding installation guide:
  https://tiptap.dev/docs/editor/getting-started/install.md, plus the page for your framework under
  `https://tiptap.dev/docs/editor/getting-started/install/` (e.g. `react.md`, `nextjs.md`, `vue3.md`,
  `svelte.md`, `nuxt.md`, `vanilla-javascript.md`).
- When server-side rendering (e.g. Next.js), set the `immediatelyRender: false` option when initializing the editor. Otherwise, the editor will crash. Learn more about this in
  https://tiptap.dev/docs/editor/getting-started/install/nextjs.md.

## React

Default to the Composable API (`<Tiptap>` + `useTiptap()`) for new code. The hook-based
`useEditor` + `<EditorContent />` API is still supported and is fine for an editor that lives in a
single component.

Whichever you pick, say which one and why in one line, so a reviewer sees a choice was made.

## Pro Extensions

Some Tiptap extensions are distributed through a private npm registry. To install pro packages, see
https://tiptap.dev/docs/guides/pro-extensions.md for setup instructions.
