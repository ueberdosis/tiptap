# TODO: React-owned rendering for Tiptap

What remains, in order. Companion file: [PROGRESS.md](./PROGRESS.md) for what's done and the
gotchas. The full spec for each phase is the runbook ("Coding Agent Runbook: React-Owned
Rendering for Tiptap") — this file is the working checklist, with pointers into the code as
it exists now.

## Immediate housekeeping

- [ ] Phases 1-3 have no PRs yet (work stacked on `react-renderer/phase-2a-internal-view-factory`,
      with Phase 1 on its own branch). Decide when to push/open PRs.

## Phase 4 — transaction rendering and `reactKeys` (NEXT)

Goal: re-render on transactions with stable component identity.

- [ ] `src/plugins/reactKeys.ts`: plugin with `posToKey`/`keyToPos` maps; init by walking the
      doc; on `apply`, map each node's position forward through the transaction to carry its
      key (drop deleted nodes). Meta support: `overrides` (explicit remaps) and `freezeFrom`.
- [ ] A `reorderSiblings`-style command that feeds reorder metadata to the plugin so keys
      survive moves.
- [ ] Consume keys as React `key` in `ChildNodeViews` (currently positional `index` — see the
      comment there). Needs access to the plugin state during render — likely the first real
      context (state/keys) this package introduces; keep `DocView`'s props compatible.
- [ ] Acceptance (mount/unmount counters via probe components or desc identity):
      typing in one paragraph does not remount siblings; splitting keeps the left key and
      mints a right key; joining keeps one deterministically; decoration-only transaction
      changes no keys; reorder preserves keys.

## Phase 5 — editing and selection

- [ ] Dispatch wiring: route through `editor.dispatchTransaction(tr)` and force a React
      re-render (Tiptap's dispatch does not trigger one). Update state without mutating
      document DOM; run `view.commitPendingEffects()` in a client layout effect after commit;
      sync selection there.
- [ ] The pieces already waiting for this: `ReactEditorView.commitPendingEffects()` (needs a
      real `docView` — registered by `DocView`'s `onDocDesc`), `EMPTY_STATE` prevState
      semantics, and the composition guard on `domObserver.onSelectionChange`.
- [ ] The desc tree needs `setSelection`/`updateOuterDeco`/`update` on `NodeViewDesc` for the
      base `updateStateInner`/`selectionToDOM` paths (deliberately left out of Phase 2C —
      derive from prosemirror-view 1.41.9 like the rest of viewdesc.ts).
- [ ] `useEditor`-style hook: construct the Tiptap `Editor` with `element: null` +
      `__internalViewFactory` (from `@tiptap/core`'s `EditorInternalOptions`), `mount()` once
      the DocView element exists. Reuse Tiptap's Proxy null-view pre-mount.
- [ ] Composition guard: do not re-render the actively composing text node.
- [ ] No `flushSync` on the render/commit path (spy assertion). Playwright for typing +
      selection round-trips (`pnpm test:e2e`; note repo e2e infra under `tests/`).

## Phase 6 — decorations and first React node views

- [ ] Decoration rendering: node decos → attrs on the node component; inline decos → split
      inline runs preserving offsets; widgets → React components in ViewDesc order (`side`,
      `stopEvent`, cleanup, stable keys). `viewdesc.ts` already exposes `widgetSide` /
      `isTrailingHack` getters for the widget/trailing-hack descs to override, and
      `NodeViewDesc.outerDeco`/`innerDeco` fields feed `matchesNode`.
- [ ] Trailing-break / separator hacks (empty paragraph currently renders `<p></p>` — PM
      needs `<p><br></p>` for contenteditable).
- [ ] One block node view with `contentDOMRef` (`useMergedRefs` already exists in
      `src/refs.ts`) and one atom node view; props contract aligned with Tiptap's
      `ReactNodeViewProps` plus `contentDOMRef`.

## Phase 7 — vertical-slice hardening

- [ ] Full Stop Criteria from the runbook §7 must pass; stop and report if any fails.
- [ ] Smoke tests: BubbleMenu/FloatingMenu positioning, drag-handle geometry, undo/redo,
      copy/paste architecture decision recorded.
- [ ] Re-run the §9 matrices (mapping, selection, identity).

## Phases 8-17 (post-slice, from the runbook)

- [ ] 8: publish experimental (drop `private: true`, changeset, experimental tag).
- [ ] 9: hooks & ergonomics (`useEditorEffect`, `useEditorEventCallback`, StrictMode-stable).
- [ ] 10: React mark views (mark boundaries under `domAtPos`/`posAtDOM`).
- [ ] 11: clipboard, paste, drag/drop, history.
- [ ] 12: IME + cross-browser (Safari is the release blocker).
- [ ] 13: collaboration (Yjs) — remount storms, cursor behavior, reactKeys fallback.
- [ ] 14: legacy node-view migration bridge (`ReactNodeViewRenderer` subset;
      `NodeViewContent` ref → `contentDOMRef`).
- [ ] 15: performance (1k/10k paragraph benchmarks, typing latency budget).
- [ ] 16: docs + migration guide.
- [ ] 17: graduate into `@tiptap/react` as default (next major).

## Known deferred items (don't lose these)

- [ ] `Editor.prependClass()` and `dom.editor = this` mutate the mount after the factory
      returns; React must tolerate/own doc-level attributes when the real integration lands
      (doc decorations / `computeDocDeco` equivalent must merge, not clobber).
- [ ] `scrollTop` writes: base `updateStateInner` scroll handling ("reset") writes
      `view.dom.scrollTop` — harmless, but note when asserting "PM never touches the DOM".
- [ ] Bubble-menu queries `[data-node-view-wrapper]` (AUDIT.md §4) — needs a fallback once
      node views exist without wrappers.
- [ ] `DocView`'s desc effect runs on every commit (no deps) — fine now, revisit for Phase 15
      perf work.
- [ ] Adjacent text runs: React renders separate strings as separate DOM text nodes — the
      desc walk assumes 1:1 text-run↔DOM-text correspondence; verify when marks split runs
      (Phase 10).
