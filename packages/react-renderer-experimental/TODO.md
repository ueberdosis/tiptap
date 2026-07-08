# TODO: React-owned rendering for Tiptap

What remains, in order. Companion file: [PROGRESS.md](./PROGRESS.md) for what's done and the
gotchas. The full spec for each phase is the runbook ("Coding Agent Runbook: React-Owned
Rendering for Tiptap") — this file is the working checklist, with pointers into the code as
it exists now.

## Immediate housekeeping

- [ ] Phases 1-3 have no PRs yet (work stacked on `react-renderer/phase-2a-internal-view-factory`,
      with Phase 1 on its own branch). Decide when to push/open PRs.

## Phase 4 — transaction rendering and `reactKeys` (DONE)

Goal: re-render on transactions with stable component identity.

- [x] `src/plugins/reactKeys.ts`: plugin with `posToKey`/`keyToPos` maps; meta support for
      `overrides` and `freezeFrom` (tracked-only until Phase 5's composition guard).
- [x] `src/commands/reorderSiblings.ts`: overrides for moved nodes and their descendants.
- [x] Keys consumed in `ChildNodeViews` via `ReactKeysContext` (`NodeView` gained `pos`,
      `ChildNodeViews` gained `innerPos`; `DocView` props unchanged).
- [x] Acceptance via host-element/desc identity: typing/split/join/no-doc-change/reorder
      (`__tests__/keyedRender.test.ts`, `__tests__/reactKeys.test.ts`).

## Phase 5: editing and selection (DONE)

- [x] Dispatch wiring (`EditorContent`: `useSyncExternalStore` on `transaction`, layout-effect
      `mount()` + `setDocView()` + `commitPendingEffects()`).
- [x] Desc tree: `setSelection`/`update`/`updateOuterDeco`/`selectNode`/`deselectNode`
      derived from prosemirror-view 1.41.9.
- [x] `useReactEditor` hook (`element: null` + `__internalViewFactory`).
- [x] `beforeInput` plugin (observer is dead, so input is intercepted and dispatched).
- [x] Composition guard (deferred re-renders while composing + `compositionend` catch-up).
- [x] No-`flushSync` path asserted (dispatch does not render synchronously).
- [x] Playwright e2e: typing + selection round-trips in a real browser
      (`demos/src/GuideNodeViews/ReactComponentExperimental/index.spec.ts`).

## Phase 6 — decorations and first React node views (DONE)

- [x] Decoration rendering: node decos → attrs merged onto the node's element (schema views
      via `renderOutputSpec` rootProps, React node views via `HTMLAttributes` +
      `decorations`/`innerDecorations` props); inline decos → text runs split by the derived
      `iterDeco`, wrapped by `DecoratedText` (desc on the wrapper, `nodeDOM` the text node);
      widgets → `WidgetView` (React components via the `widget()` helper, native `toDOM`
      widgets hosted in a span), ordered by `side`, `stopEvent`/`destroy`/keys honored.
      `viewDecorations()` + `DecorationSourceGroup` derived from prosemirror-view compute the
      per-state source in `EditorContent`.
- [x] Trailing-break hack (`TrailingHackViewDesc` + `TrailingHackView`); the Safari/gecko
      IMG separator hack variant is still open (Phase 12 browser matrix).
- [x] Node views: `NodeViewComponentProps` contract, `ReactNodeView`, dispatch in
      `NodeView`, registration via `EditorContent`'s `nodeViews` prop, atom + content
      (contentDOMRef/useMergedRefs) covered by unit tests and the experimental demo e2e.
- [x] Schema mark rendering (`MarkView`/`MarkViewDesc`, mark grouping, mark-aware child
      walk). Custom React mark views remain Phase 10.
- [x] Doc attributes (`computeDocDeco` equivalent in `EditorContent`).

## Phase 7 — vertical-slice hardening (DONE — see the verdict table in PROGRESS.md)

- [x] Full Stop Criteria from the runbook §7 pass (criterion-by-criterion evidence table
      in PROGRESS.md; browser-level rows rest on the e2e specs, green on the device with
      browser deps).
- [x] Smoke tests: BubbleMenu/FloatingMenu plugin views run against the renderer,
      drag-handle geometry APIs smoke-tested, undo/redo restores content+selection+host
      identity, copy/paste decision recorded in ARCHITECTURE.md (schema-based, unchanged).
- [x] §9 matrices re-run (mapping/identity at unit level, selection unit + e2e).
- [ ] Real-coordinate positioning (BubbleMenu placement values) is only meaningful in a
      browser — eyeball on the demos when convenient; blockers would surface in Phase 12
      anyway.

## Phases 8-17 (post-slice, from the runbook)

- [ ] 8: publish experimental (drop `private: true`, changeset, experimental tag).
      **The user publishes manually** — do not automate this step.
- [x] 9: hooks & ergonomics (DONE — see PROGRESS.md): StrictMode-safe `useReactEditor`
      (instance manager with one-tick destruction grace, deps-driven recreation,
      latest-callback routing), EditorContent guards (destroyed-editor error, second-
      EditorContent warning), `useEditorEffect` (commit-effect registry),
      `useEditorEventCallback`, `useEditorEventListener`, and the node-view hooks
      (`useNodePos`, `useIsNodeSelected`, `useStopEvent`, `useIgnoreMutation` via
      `NodeViewContext`). Remaining niggle: the double-'unmount' emission lives in core
      (`destroy()` calls `unmount()` unconditionally) — out of guardrail scope, documented.
- [x] 10: React mark views (DONE — see PROGRESS.md): rendering/contract/registration plus
      the boundary matrices (overlapping, adjacent, non-spanning, custom views with
      chrome, decorations inside mark views). `MarkViewContent`-style legacy bridging
      stays with Phase 14.
- [x] 11: clipboard, paste, drag/drop, history (DONE — verification; see PROGRESS.md).
      Copy/paste/history/bookmarks pinned down in `clipboardHistory.test.ts`; the drop
      half of drag/drop needs browser layout — verified manually in the demos, add a
      Playwright DnD spec on the browser device if regressions appear.
- [ ] 12: IME + cross-browser (Safari is the release blocker).
- [ ] 13: collaboration (Yjs) — remount storms, cursor behavior, reactKeys fallback.
      Groundwork exists: `Demos/CollaborationSplitPaneExperimental` (two editors, one
      shared Y.Doc) proves basic sync; carets/awareness and remount profiling remain.
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
- [ ] Double-'unmount' emission on destroy-after-unmount: core's `destroy()` calls
      `unmount()` unconditionally, which emits even when already unmounted. Fixing it
      means touching core beyond the sanctioned factory seam — revisit at Phase 17.
      (The other Phase 5 review items — StrictMode, destroyed-editor crash, second
      EditorContent — were fixed in Phase 9.)
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
- [ ] Decoration gaps (Phase 6 scope cuts): widget `spec.marks` mark-context is ignored
      (widgets render into the current mark stack); `nodeName` decorations on _elements_
      apply their attrs but not the rename (text runs support `nodeName` levels fully); the
      cursor-wrapper decoration is not rendered (composition, Phase 12); native `toDOM`
      widgets are hosted inside an extra span (document nodes stay wrapper-free — widgets
      are decoration UI).
- [ ] Playwright on this machine needs browser system deps
      (`sudo npx playwright install-deps chromium`); e2e currently only runs on the other
      device.
- [ ] Core `updateAttributes` command uses `setNodeMarkup`, which maps the node as deleted
      and remounts its React node view. Our node-view `updateAttributes` prop uses AttrStep
      instead; Phase 7 must decide how core commands behave under the new renderer (this is
      the command-coupling risk the runbook flags).
