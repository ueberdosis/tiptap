# TODO: React-owned rendering for Tiptap

What remains, in order. Companion file: [PROGRESS.md](./PROGRESS.md) for what's done and the
gotchas. The full spec for each phase is the runbook ("Coding Agent Runbook: React-Owned
Rendering for Tiptap") — this file is the working checklist, with pointers into the code as
it exists now.

## Immediate housekeeping

- [ ] Phases 1-3 have no PRs yet (work stacked on `react-renderer/phase-2a-internal-view-factory`,
      with Phase 1 on its own branch). Decide when to push/open PRs.

## Phase 4 — transaction rendering and `reactKeys` (DONE, pending commit)

Goal: re-render on transactions with stable component identity.

- [x] `src/plugins/reactKeys.ts`: plugin with `posToKey`/`keyToPos` maps; meta support for
      `overrides` and `freezeFrom` (tracked-only until Phase 5's composition guard).
- [x] `src/commands/reorderSiblings.ts`: overrides for moved nodes and their descendants.
- [x] Keys consumed in `ChildNodeViews` via `ReactKeysContext` (`NodeView` gained `pos`,
      `ChildNodeViews` gained `innerPos`; `DocView` props unchanged).
- [x] Acceptance via host-element/desc identity: typing/split/join/no-doc-change/reorder
      (`__tests__/keyedRender.test.ts`, `__tests__/reactKeys.test.ts`).

## Phase 5: editing and selection (core DONE, pending commit)

- [x] Dispatch wiring (`EditorContent`: `useSyncExternalStore` on `transaction`, layout-effect
      `mount()` + `setDocView()` + `commitPendingEffects()`).
- [x] Desc tree: `setSelection`/`update`/`updateOuterDeco`/`selectNode`/`deselectNode`
      derived from prosemirror-view 1.41.9.
- [x] `useReactEditor` hook (`element: null` + `__internalViewFactory`).
- [x] `beforeInput` plugin (observer is dead, so input is intercepted and dispatched).
- [x] Composition guard (deferred re-renders while composing + `compositionend` catch-up).
- [x] No-`flushSync` path asserted (dispatch does not render synchronously).
- [ ] Playwright e2e: typing + selection round-trips in a real browser (needs a demo page
      wired into `tests/`). Decide scope with the team.

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
      (doc decorations / `computeDocDeco` equivalent must merge, not clobber). Also:
      repeated mount cycles prepend `tiptap` again each time, and a changing `className`
      prop on `EditorContent` makes React clobber the core-prepended classes.
- [ ] Phase 9 lifecycle items found in the Phase 5 review: `useReactEditor` is not
      StrictMode-safe (cleanup destroys the singleton editor); mounting a destroyed editor
      crashes in `createView` (no public destroyed-vs-unmounted distinction pre-mount);
      teardown emits `unmount` twice (EditorContent cleanup + `destroy()`'s internal
      unmount); rendering one editor in two `EditorContent`s concurrently is unsupported
      (stale `view.dom` on the first).
- [ ] `scrollTop` writes: base `updateStateInner` scroll handling ("reset") writes
      `view.dom.scrollTop` — harmless, but note when asserting "PM never touches the DOM".
- [ ] Bubble-menu queries `[data-node-view-wrapper]` (AUDIT.md §4) — needs a fallback once
      node views exist without wrappers.
- [ ] `DocView`'s desc effect runs on every commit (no deps) — fine now, revisit for Phase 15
      perf work.
- [ ] `reactKeys` `apply` is O(doc) per doc-changing transaction (entry sort + remap + full
      `descendants` walk to mint fresh keys; the reference does the same). Bound it to changed
      ranges in Phase 15 if profiling shows it.
- [ ] `ReactKeysContext` carries the whole plugin state; a `freezeFrom`-only change re-renders
      key consumers. Narrow the context value when Phase 5 wires the real provider if that
      churn matters.
- [ ] `keys?.posToKey.get(childPos) ?? index` silently falls back when a provider exists but
      the position is missing (a doc/state desync). Phase 5 single-sources both from the
      editor state; consider a dev-mode warning then.
- [ ] Adjacent text runs: React renders separate strings as separate DOM text nodes — the
      desc walk assumes 1:1 text-run↔DOM-text correspondence; verify when marks split runs
      (Phase 10).
