# Progress: React-owned rendering for Tiptap

Running log of the phased build of `@tiptap/react-renderer-experimental`, per the runbook
("Coding Agent Runbook: React-Owned Rendering for Tiptap"). Companion file: [TODO.md](./TODO.md)
for what's next. Ground-truth audit: [AUDIT.md](./AUDIT.md).

## Where things stand

- **Branches.** Phase 1 lives on `react-renderer/phase-1-audit-and-scaffold`. Phases 2A+
  live on `react-renderer/phase-2a-internal-view-factory` (the runbook's one-branch-per-phase
  rule was dropped by request — everything continues on this branch).
- **Completed: Phases 1, 2A, 2B, 2C, 3, 4, 5, 6 node views (committed); manual-testing
  bug-fix round (pending commit): selection sync, trailing-break hack, mark rendering,
  doc attributes.**
- **Phase 6 remaining: decorations** (node/inline/widget).
- Playwright e2e runs against `demos/src/GuideNodeViews/ReactComponentExperimental`
  (14 specs: node view without wrapper, typing, DOM-selection sync, marks, input rules,
  paste, whitespace, undo/redo).
- `prosemirror-view` is pinned at **1.41.9** (see AUDIT.md §1-2; compat test enforces it).

## Validation commands

```bash
pnpm vitest run packages/react-renderer-experimental   # this package's tests
pnpm --filter @tiptap/react-renderer-experimental build
pnpm lint && pnpm format
pnpm test:unit
pnpm fallow:audit   # must end "pass" or "warn" — sole expected warn is the
                    # pre-existing dispatchTransaction complexity in core/src/Editor.ts
```

## Phase log

### Phase 1 — audit and scaffold (committed: `93f8e38f8`)

- Scaffolded the package (mirrors `packages/react` layout; single tsup entry; dual ESM/CJS).
  **Marked `private: true`** so the fixed-version changesets release train doesn't publish it
  before Phase 8; it still carries the shared version (3.27.3 at the time).
- Wrote `AUDIT.md`: the prosemirror-view pin, every private symbol we touch (verified against
  1.41.9 source with line numbers), the repo-wide inventory of DOM-coupled code, and command
  verdicts (`updateAttributes` is state-only/safe; `focus`/`blur` touch `view.dom` but stay
  compatible since React renders _into_ `view.dom`).
- Key trap recorded: `EditorView.isDestroyed` is literally `this.docView == null` in 1.41.9.

### Phase 2A — internal view factory in core (committed: `03e5bb25b`)

- `packages/core/src/types.ts`: new `EditorInternalOptions` interface (exported, `@internal`
  JSDoc) holding `__internalViewFactory?: (element, props) => EditorView`. Deliberately not a
  member of the public `EditorOptions`.
- `packages/core/src/Editor.ts` `createView()`: props built into a `viewProps` variable, then
  `viewFactory ? viewFactory(element, viewProps) : new EditorView(element, viewProps)`. Zero
  behavior change without the option (tested via prototype identity).
- Tests: `packages/core/src/__tests__/internalViewFactory.test.ts`. Changeset added
  (`.changeset/heavy-moons-behave.md`, patch).

### Phase 2B — ReactEditorView (committed: `0a7382f36` + fixes in Phase 3 commit)

- `src/constants.ts`: `EMPTY_SCHEMA` (doc allows no content) + `EMPTY_STATE`.
- `src/ReactEditorView.ts`: the `EditorView` subclass. Mechanics:
  - Constructor detaches mount children+attributes, `super({ mount }, { …props,
state: EMPTY_STATE, plugins: [] })`, restores in `finally`. Then: stop DOM observer, null
    `domObserver.observer`, clear `queue`, wrap `onSelectionChange` with the composition
    guard, destroy+null the base `docView`. Input listeners from `initInput` stay (PM keeps
    input handling).
  - Pure updates: `update`/`setProps`/`updateState` stage onto `nextProps`, expose `state`
    eagerly, recompute `editable` via public `someProp`. Overridden `props` getter returns
    staged props.
  - `commitPendingEffects()`: roll `state` back to `prevState`, `docView.markDirty(-1,-1)`,
    `super.update(nextProps)`, advance `prevState`. **`prevState` must initialize to
    `EMPTY_STATE`** (what the base actually committed) or the first commit's plugin diff sees
    no change and plugin views never initialize. Plugin views initialize on first commit.
  - `destroy()`: swaps an inert stub doc view in (base `destroy()` early-returns on null
    docView, skipping input/plugin cleanup, and would otherwise redraw/clear our tree);
    stashes/restores React-owned children around base teardown; `isDestroyed` shadowed with
    an own flag.
  - All private access documented in one `EditorViewInternals` interface (guardrail 6).
- Tests: `__tests__/ReactEditorView.test.ts` (construction, purity, commit, teardown, Editor
  factory integration) and `__tests__/prosemirrorViewCompat.test.ts` (pins 1.41.9 resolved
  through `@tiptap/pm`, asserts every internal symbol's shape, and the isDestroyed trap).

### Phase 2C — ViewDesc mapping layer (committed: `4ad568682`)

- `src/viewdesc.ts`: derived from prosemirror-view 1.41.9's `viewdesc.ts`/`dom.ts` (MIT,
  attributed in header), mapping layer only: `ViewDesc` base (`posFromDOM`, `localPosFromDOM`,
  `nearestDesc`, `getDesc`, `descAt`, `domFromPos`, `domAfterPos`, position getters, dirty
  tracking, `pmViewDesc` expando), `NodeViewDesc`, `TextViewDesc`. No rendering/parsing/
  reconciliation — React owns DOM creation.
- **The expando keeps PM's exact property name `pmViewDesc`** — base input/selection code
  looks descs up through it. Safe type-wise: the published d.ts declares the global `Node`
  augmentation but strips the member.
- Widget/trailing-hack branches in `domFromPos` became overridable getters (`widgetSide`,
  `isTrailingHack`) for Phase 6 to slot into.
- PM semantics note: at a child boundary with `side=0`, `domFromPos` stays on the element
  boundary; only nonzero side descends into text.
- Tests: `__tests__/viewdesc.test.ts` — mapping matrix, selection round-trips, dirty
  tracking (incl. the `markDirty(-1,-1)` sentinel), `matchesNode`, expando cleanup.

### Phase 3 — static React document rendering (committed: the commit introducing this file)

- `src/components/NodeView.tsx`: schema-rendered nodes via `toDOM` specs — exact elements, no
  wrapper DOM. `ChildNodeViews` co-located (mutually recursive; also kills a circular import).
  Text children render as bare strings.
- `src/components/OutputSpecView.tsx` (+ `src/props.ts`): `toDOM` spec → React elements;
  `ref` on outermost element, `contentRef` on the hole element; `class`/`style`-string
  conversion. Raw-DOM and namespaced specs throw.
- `src/components/DocView.tsx` + `src/hooks/useNodeViewDesc.ts` + `src/descriptors.ts`:
  **desc registration via DOM walk** — each node's layout effect refreshes its desc in place
  and rebuilds children by walking its `contentDOM`. React runs layout effects
  children-before-parents, so the walk always sees refreshed child descs in document order
  (no registry contexts, no ordering problem). Text descs are bound by the parent's walk
  (React cannot ref a text node — and `findDOMNode`/react-reconciler is banned).
- Two ReactEditorView bugs found by testing on React-rendered mounts (earlier tests used a
  separate div): base constructor claims and then clears the mount's `pmViewDesc` expando
  (now snapshot+restored after the base doc view is destroyed), and `destroy()` ran base
  teardown against the real tree (now always swaps the inert stub).
- Tests: `__tests__/staticRender.test.ts` — byte-exact markup, desc/DOM correspondence, the
  full mapping+selection matrix through real view APIs on React DOM, hard breaks, re-render
  updates, empty paragraphs, StrictMode.

### Phase 4 — transaction rendering and `reactKeys`

- `src/plugins/reactKeys.ts`: stable key per node (text included, like the reference; keying
  only elements let DOM text nodes remount when an element sibling was inserted before them),
  keyed by current position. `init` walks the doc; `apply` maps each position forward
  (`tr.mapping.mapResult`, sorted ascending so collisions resolve deterministically, evicting
  the displaced key from `keyToPos` so it stays an exact inverse), drops deleted nodes, mints
  fresh keys for unknown positions. Meta (`reactKeysPluginKey`): `overrides` (old pos → new
  pos, replaces mapping) and `freezeFrom` (explicit set/clear, always honored). `freezeFrom`
  otherwise maps forward with assoc -1 and clears itself when the frozen block is deleted or
  changed outside a `composition`-meta transaction. Consumed by the Phase 5 composition
  guard; tracked-only for now.
- `src/commands/reorderSiblings.ts`: reorders a parent's children (`order[slot]` = old index),
  emits overrides for every child **and its descendants** (the reference only overrides
  top-level siblings, so their children would remount on a move; ours shift descendants by
  the same delta). Returns false (instead of throwing) for non-integer orders and for orders
  the parent's content expression rejects (`parent.canReplace`).
- Key consumption: `NodeView` now takes `pos`, `ChildNodeViews` takes `innerPos`; children
  use `posToKey.get(childPos)` as React `key`, falling back to the index when no
  `ReactKeysContext` provider exists (static rendering stays unchanged). DocView's public
  props are untouched (`innerPos` for doc children is 0).
- `src/contexts/ReactKeysContext.ts`: the package's first context; Phase 5's editor wiring
  becomes the real provider.
- Tests: `__tests__/reactKeys.test.ts` (plugin semantics incl. split/join/reorder/freeze and
  regression tests from the review pass), `__tests__/keyedRender.test.ts` (remount detection
  via host-element + desc identity; the reorder case is the one that fails without keys,
  since slot 0 changes node type). Shared fixtures extracted to `__tests__/helpers.ts`
  (fallow duplication finding).

### Phase 5: editing and selection (core; e2e pending)

- `src/viewdesc.ts` grew the base-view-facing surface, derived from prosemirror-view 1.41.9:
  `ViewDesc.setSelection` (child descent + DOM selection write with the gecko/safari BR
  kludges), `NodeViewDesc.update` (accepts + refreshes fields, never reconciles children;
  returning true here is what stops the base class from redrawing), `updateOuterDeco`
  (field-only), `selectNode`/`deselectNode`. Helpers `isEquivalentPosition`/`scanFor`/
  `nodeSize`/`hasBlockDesc` derived from PM's `dom.ts`; `src/browser.ts` has the minimal
  gecko/safari flags. `view.domSelectionRange()` is internal, documented in
  `ViewSelectionInternals`.
- `src/ReactEditorView.ts`: public `setDocView()` so the integration never pokes privates.
- `src/extension.ts` (`ReactRendererExtension`): adds `reactKeys()` + `beforeInput()`.
- `src/plugins/beforeInput.ts`: with the mutation observer dead, editing input is intercepted
  at `beforeinput` and re-expressed as transactions: insertText (targetRanges-aware),
  insertParagraph/insertLineBreak (synthetic Enter through `someProp('handleKeyDown')`, so
  keymaps run), insertReplacementText, the delete\* family (`ensureMarks` across the range).
  `insertFromComposition` is not prevented. `input.lastIOSEnter` write documented.
- `src/hooks/useReactEditor.ts`: constructs the Tiptap `Editor` with `element: null`, the
  `__internalViewFactory` producing a `ReactEditorView`, and the extension; destroys on
  unmount. StrictMode hardening is Phase 9.
- `src/components/EditorContent.tsx`: `useSyncExternalStore` on `editor.on('transaction')`;
  layout effect mounts the editor onto the DocView element on first commit (the pre-mount
  `editor.view` Proxy is detected via `instanceof ReactEditorView`; note
  `editor.isDestroyed` is TRUE pre-mount, do not guard on it), then `setDocView(desc)` +
  `commitPendingEffects()` every commit. Composition guard: transaction notifications are
  deferred while `view.composing`, with a once-`compositionend` listener to catch up when PM
  dispatches nothing afterwards. No `flushSync` anywhere; a test asserts dispatch does not
  render synchronously.
- Pre-mount `editorState` has no plugins, so the first render uses index keys; the
  `useSyncExternalStore` snapshot check re-renders with reactKeys state right after mount
  (one-time, pre-focus child remount).
- Tests: `__tests__/editorContent.test.ts` (mount, edits without remount, async render,
  DOM selection sync, plugin views, undo/redo, composition defer, posAtDOM round-trip),
  `__tests__/beforeInput.test.ts` (typing, target ranges, Enter via keymap, backspace,
  composition passthrough). Tiptap-flavored render helper in `__tests__/helpers.ts`.

### Phase 6 (part 1): React node views + experimental demo

- Registration is a React-layer concern: `EditorContent` takes `nodeViews`
  (`Record<nodeTypeName, NodeViewComponent>`), provided through `EditorContext` together
  with the editor. Extension-side `addNodeView()` cannot carry a component marker because
  ExtensionManager wraps the result in a fresh closure (the reference registers via a React
  prop for the same reason). Phase 14's bridge maps legacy extensions onto this.
- `src/components/NodeViewComponentProps.ts`: the contract (editor, node, HTMLAttributes,
  getPos, selected, updateAttributes, deleteNode, ref, contentDOMRef, children). Types live
  in their own module so `EditorContext` and `ReactNodeView` share them without a cycle;
  the NodeView dispatcher pre-renders `children` so `ReactNodeView` never imports
  `ChildNodeViews` (also cycle avoidance).
- `NodeView` is now a dispatcher: registered component → `ReactNodeView`, else
  `SchemaNodeView` (the old toDOM path). Hook counts stay consistent per branch.
- **`updateAttributes` uses AttrStep (`tr.setNodeAttribute`), not `setNodeMarkup`:** markup
  replacement maps the node as deleted, drops its reactKeys key, and remounts the component
  (a test proves it). Core's `updateAttributes` command still has this problem (TODO).
- `getPos` resolves from the live desc (`descRef.current.posBefore`), so it stays correct
  between renders; `useNodeViewDesc` now returns its desc ref.
- Demo: `demos/src/GuideNodeViews/ReactComponentExperimental/React` (new variant beside the
  legacy demo, which stays as documentation of the shipping API). The demos vite config
  aliases `@tiptap/react-renderer-experimental` to package source automatically. Spec covers
  the no-wrapper assertion plus the Phase 5 typing/selection/undo matrix.
- Playwright gotcha: Tiptap's `focus` command defers `view.focus()` to
  `requestAnimationFrame`, which is unreliable to sequence in headless runs — focus via a
  real `.click()` in specs, then set selection through commands.

### Manual-testing bug-fix round (after Phase 6 node views)

All four user-reported bugs traced to gaps the unit suite could not see:

- **DOM→state selection sync was dead.** `flush()` calls `desc.ignoreMutation()` on every
  `selectionchange`; the Phase 2C mapping layer never derived it, so the listener threw
  (silently) and clicks/cursor moves never reached the state — typing, Backspace, Delete,
  and Enter all acted at a stale selection. Fixed by deriving `ignoreMutation` (base
  ViewDesc). Also: `selectionchange` delivery is async, so `beforeInput` now flushes the
  pending selection read (`domObserver.flush()`, documented internal) on keydown and
  beforeinput before acting; vanilla PM does not need this because it parses DOM mutations
  where the browser applied them.
- **Trailing-break hack.** Empty paragraphs rendered `<p></p>`: zero height, unclickable
  (why typing "in the newly added paragraph" failed). `TrailingHackViewDesc` (size 0) +
  `TrailingHackView` rendering `<br>` when a textblock is empty or ends in a break;
  `rebuildChildDescs` accepts hack descs.
- **Marks were not rendered at all.** Text runs rendered as bare strings, dropping bold/
  italic/etc. Added `MarkViewDesc` (derived; dirty bubbles to the nearest node desc),
  `MarkView` (schema `toDOM` via renderOutputSpec), mark grouping in `ChildNodeViews`
  (shared prefixes merge, `spanning: false` respected), and a cursor-based recursive child
  walk in `descriptors.ts` (the flat inline sequence continues inside mark elements).
  Custom React mark views stay Phase 10.
- **Doc attributes were never applied.** The base view's `computeDocDeco` is bypassed, so
  `view.dom` lacked the `ProseMirror` class — the injected `white-space: pre-wrap` CSS
  never matched, collapsing consecutive/trailing spaces ("space does nothing at the end
  of a paragraph"). `EditorContent` now computes them PM-style (`someProp('attributes')`,
  class/style merge, `translate="no"`); the `tiptap` class stays `prependClass`-owned
  (outside React) so its raw concat survives.
- macOS double-space→period is OS text substitution surfacing through
  `insertReplacementText`; behavior now matches the legacy renderer.

## Gotchas for future sessions

- **pnpm supply-chain gate.** A full `pnpm install` re-resolves registry deps and can pull a
  `@tiptap/*` version younger than the environment's `minimumReleaseAge` (~24h), which fails
  a verifier that ignores `minimumReleaseAgeExclude` — and then blocks every pnpm command.
  When adding deps that already exist in the lockfile: revert lockfile churn and hand-add the
  importer block to `pnpm-lock.yaml`, then `pnpm install` reports "Already up to date".
- **JSX.** The root vitest config compiles JSX with `jsxImportSource: '@tiptap/core'`. Every
  React component file needs `/** @jsxImportSource react */` as its first line. Test files
  must be `.ts` (vitest's include misses `.tsx`) — use `createElement` in tests.
- **React in happy-dom tests.** Set `globalThis.IS_REACT_ACT_ENVIRONMENT = true`, wrap
  render/unmount in `await act(async () => …)`. **Never `toMatchObject` a value containing an
  attached DOM node** — vitest deep-walks the whole happy-dom window graph and hangs. Assert
  `.node`/`.offset` with `toBe`.
- **fallow config.** `.fallowrc.json` has a scoped exception for `src/viewdesc.ts` only
  (complexity + unused-class-members): complexity is inherited from the derived origin;
  "unused" members are called polymorphically by the base view. Everything else gets fixed,
  not suppressed.
- **Pre-existing full-suite flake.** `pnpm test:unit` sometimes exits 1 with happy-dom
  `AsyncTaskManager` errors from an import-time fetch racing frame teardown (sandboxed
  network). Reproduces on a clean tree; all tests still pass. Judge runs by the test counts.
- **Runbook guardrails that bite:** never copy from `@handlewithcare/react-prosemirror`
  (study only; ViewDesc derives from prosemirror-view's MIT source); no commit trailers /
  AI attributions; comment every private prosemirror-view access with symbol/why/invariant/
  "verified against 1.41.9".
