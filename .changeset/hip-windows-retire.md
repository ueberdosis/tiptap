---
'@tiptap/core': patch
---

Improve typing and docs for `EditorOptions.element` to reflect all supported mounting modes and align behavior across adapters.

- `element` now accepts:
  - `Element`: the editor is appended inside the given element.
  - `{ mount: HTMLElement }`: the editor is mounted directly to `mount` (no extra wrapper).
  - `(editorEl: HTMLElement) => void`: a function that receives the editor element so you can place it anywhere in the DOM.
  - `null`: no automatic mounting.
