# Progress: React-owned rendering for Tiptap

Running log of the phased build of `@tiptap/react-renderer-experimental`, per the runbook
("Coding Agent Runbook: React-Owned Rendering for Tiptap"). Companion file: [TODO.md](./TODO.md)
for what's next. Ground-truth audit: [AUDIT.md](./AUDIT.md).

## Where things stand

- **Branches.** Phase 1 lives on `react-renderer/phase-1-audit-and-scaffold`. Phases 2A+
  live on `react-renderer/phase-2a-internal-view-factory` (the runbook's one-branch-per-phase
  rule was dropped by request — everything continues on this branch).
- **Completed: Phases 1, 2A, 2B, 2C, 3.** All committed.
- **Next: Phase 4** — transaction rendering + the `reactKeys` plugin (see TODO.md).
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
