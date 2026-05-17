---
"@tiptap/editor": major
---

Introduce `@tiptap/editor`, a unified entrypoint for Tiptap 4.0 that consolidates the core editor APIs and lightweight extensions behind subpath exports.

- Root entrypoint exposes the core APIs only (`Editor`, `Extension`, `Node`, `Mark`, common utilities, types).
- `Document`, `Paragraph`, and `Text` are automatically registered on the exported `Editor`, so `new Editor({ content: '<p>Hello</p>' })` works without explicitly listing them. Pass a node with the same `name` to override any default; reach for `@tiptap/core`'s `Editor` to opt out entirely.
- Lightweight nodes, marks, extensions, and the starter kit are exposed under subpaths: `@tiptap/editor/nodes/*`, `@tiptap/editor/marks/*`, `@tiptap/editor/extensions/*`, `@tiptap/editor/kits/starter`.
- React adapter at `@tiptap/editor/react` re-exports the React-specific surface and a `useEditor` that wires up the default core nodes.
- The root entrypoint never imports React; React stays an optional peer dependency.
- `sideEffects: false` and per-subpath dist files preserve tree-shaking.
