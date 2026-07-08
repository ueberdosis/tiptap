# Architecture: @tiptap/react-renderer-experimental

How this package works: what each module does and how the pieces cooperate.
Companions: [AUDIT.md](./AUDIT.md) (the ground-truth audit and every private
prosemirror-view symbol we touch), [PROGRESS.md](./PROGRESS.md) (phase log),
[TODO.md](./TODO.md) (what's next).

## The idea

In the legacy integration, ProseMirror owns the editable document DOM and
React node views are mounted through portals into wrapper elements. That
costs extra DOM (`<div><p><span>…` instead of `<p>`), breaks React context
between parent and child node views, and forces `flushSync` so ProseMirror
can read the DOM synchronously.

This package inverts one — and only one — responsibility:

| Concern                                                            | Owner                                         |
| ------------------------------------------------------------------ | --------------------------------------------- |
| Document DOM (creating, updating, removing elements)               | **React**                                     |
| State, transactions, plugins, commands                             | ProseMirror                                   |
| Selection semantics, input handling, clipboard, drag/drop          | ProseMirror                                   |
| Position ↔ DOM mapping and geometry (`posAtDOM`, `coordsAtPos`, …) | ProseMirror APIs, backed by **our** desc tree |

ProseMirror stays the single source of truth. React is a _renderer_ of
ProseMirror state, the way it is a renderer of any other state. The bridge
between the two worlds is built from four mechanisms, each described below:

1. a subclassed `EditorView` that never renders (`ReactEditorView`),
2. a re-derived `ViewDesc` tree registered against React-rendered DOM,
3. a commit-effect step that applies staged state to the base view _after_
   React has committed matching DOM (`commitPendingEffects`),
4. a `beforeinput` plugin that re-expresses editing input as transactions,
   because the DOM mutation observer is deliberately dead.

## Module map

```
src/
├── ReactEditorView.ts        the EditorView subclass (never renders; stages updates)
├── constants.ts              EMPTY_SCHEMA / EMPTY_STATE the base class is built against
├── viewdesc.ts               ViewDesc tree, derived from prosemirror-view (MIT)
├── descriptors.ts            desc creation/refresh + the DOM child walk
├── browser.ts                minimal gecko/safari flags for selection kludges
├── props.ts                  toDOM attrs → React props (class/style conversion)
├── refs.ts                   mergeRefs / useMergedRefs
├── extension.ts              ReactRendererExtension = reactKeys() + beforeInput()
├── components/
│   ├── EditorContent.tsx     top-level component: subscription, contexts, commit effect
│   ├── DocView.tsx           the document element (= view.dom), root of the desc tree
│   ├── NodeView.tsx          per-node dispatcher + schema rendering + ChildNodeViews
│   ├── ReactNodeView.tsx     user node view components (contract + desc registration)
│   ├── NodeViewComponentProps.ts  the node view props contract
│   ├── MarkView.tsx          per-mark dispatcher + schema mark rendering
│   ├── ReactMarkView.tsx     user mark view components
│   ├── MarkViewComponentProps.ts  the mark view props contract
│   ├── OutputSpecView.tsx    toDOM output spec → React elements
│   ├── DecoratedText.tsx     text runs wrapped by inline decorations
│   ├── WidgetView.tsx        widget decorations (React components or hosted DOM)
│   └── TrailingHackView.tsx  the contenteditable trailing-<br> hack
├── decorations/
│   ├── internals.ts          every private decoration API access, in one place
│   ├── viewDecorations.ts    per-state decoration source (derived DecorationGroup)
│   ├── iterDeco.ts           child walk interleaved with decorations (derived)
│   ├── outerDeco.ts          decoration attrs → wrap levels / element attrs
│   └── widget.ts             widget() helper: React-component widget decorations
├── plugins/
│   ├── reactKeys.ts          stable per-node keys across transactions
│   └── beforeInput.ts        editing input → transactions
├── commands/
│   └── reorderSiblings.ts    sibling reorder that feeds key overrides
├── hooks/
│   ├── useReactEditor.ts     construct the Tiptap Editor wired to this renderer
│   ├── useNodeViewDesc.ts    register a node's desc against its rendered DOM
│   ├── useMarkViewDesc.ts    same for marks
│   └── useDescCleanup.ts     shared unmount cleanup
└── contexts/
    ├── EditorContext.ts      editor + nodeViews/markViews registries
    └── ReactKeysContext.ts   the reactKeys plugin state for key lookup
```

One change lives outside the package: `@tiptap/core`'s `createView()` accepts
an internal `__internalViewFactory` option (see `EditorInternalOptions` in
core's `types.ts`). It is the sanctioned seam through which `useReactEditor`
substitutes a `ReactEditorView` for the plain `EditorView` — no private-field
assignment anywhere.

## ReactEditorView: an EditorView that never renders

`ReactEditorView` subclasses ProseMirror's `EditorView` so that every plugin,
command, and helper that expects a real view keeps working — while the parts
that would render or observe the document DOM are neutralized at
construction:

- The base constructor is called with `{ mount }` (the React-rendered
  document element is the editor element itself) and **`EMPTY_STATE`** — a
  state over a schema whose doc allows no content — so it has nothing real to
  render. The mount's children, attributes, and `pmViewDesc` expando are
  snapshotted before `super()` and restored afterwards; whatever the base
  class rendered for the empty doc is discarded.
- The **DOM mutation observer is killed**: stopped, its `MutationObserver`
  nulled (so later `start()` calls cannot re-observe), its queue cleared.
  React's DOM mutations must never be read back as input. The observer's
  `selectionchange` listener survives — wrapped so it no-ops during IME
  composition — because ProseMirror still learns about cursor moves that way.
- The base-rendered **`docView` is destroyed and nulled**. React registers a
  replacement tree later (see the desc section). Because the base getter
  `isDestroyed` is literally `docView == null` in the pinned
  prosemirror-view, the subclass shadows it with an own flag.
- Input listeners from the base `initInput` stay attached: ProseMirror keeps
  owning keyboard, clipboard, drag/drop, and composition events.

Updates are **pure**: `update` / `setProps` / `updateState` only stage the
new props on a `nextProps` field and expose the new `state` eagerly — no DOM
work, which is why no `flushSync` is needed anywhere. The overridden `props`
getter returns the staged props so between-commit readers always see current
values. The staged props reach the base class only in
**`commitPendingEffects()`**, called from a layout effect after React
committed DOM matching the new state: it rolls `state` back to the last
committed state, marks the doc desc dirty, and hands `nextProps` to
`super.update()` — the base class then updates plugin views, validates the
DOM selection (`selectionToDOM`), and fires node-view selection callbacks
against real DOM. `destroy()` swaps an inert stub doc view in so the base
teardown (input listeners, plugin views) runs without touching the
React-owned tree, and restores the React children the base clears.

## The ViewDesc tree: how mapping keeps working

`posAtDOM`, `domAtPos`, `nodeDOM`, `coordsAtPos`, `posAtCoords`, selection
reading and writing — all of ProseMirror's geometry rests on its internal
`ViewDesc` tree and the `pmViewDesc` expando linking DOM nodes back to their
descs. `viewdesc.ts` re-derives that layer from prosemirror-view's own MIT
source (attributed in the header), minus everything that creates or
reconciles DOM: `ViewDesc` (mapping, dirty tracking, `setSelection`),
`NodeViewDesc` (+ `update`/`matchesNode` so `commitPendingEffects` works),
`TextViewDesc`, `MarkViewDesc`, `WidgetViewDesc`, `TrailingHackViewDesc`.

Two derivation rules matter:

- **The expando keeps ProseMirror's exact property name** (`pmViewDesc`),
  because the base view's input and selection code looks descs up through
  it. The published types declare the global augmentation but strip the
  member, so our declaration does not conflict.
- `NodeViewDesc.update()` **never returns false.** Returning false sends the
  base class down its redraw path, which would render ProseMirror-owned DOM
  into the React-owned mount. By the time it is called (from
  `commitPendingEffects`), React has already rendered the node — accepting
  and refreshing is always correct.

**Registration happens via a DOM walk, not a registry.** Each rendered node
keeps a stable desc instance (created once per component, mutated across
commits) registered on its element by a layout effect
(`useNodeViewDesc`). React runs layout effects children-before-parents, so
when a parent's effect walks its `contentDOM` (`rebuildChildDescs` in
`descriptors.ts`), every child element already carries a refreshed desc —
walking the DOM yields children in document order with no ordering
bookkeeping. The walk also does the work React cannot: DOM **text nodes**
can't take refs, so the parent binds them to (slices of) its text children
by a size-tracking cursor; it descends into mark elements (the flat inline
sequence continues inside); and it claims zero-size descs (widgets,
trailing hacks) without advancing.

The root of the tree is the element `DocView` renders — which is also
`view.dom`. After every commit, `EditorContent` hands the refreshed root desc
to the view (`setDocView`) before calling `commitPendingEffects()`.

## The render cycle

```
   user input / command
          │
          ▼
  beforeInput plugin ──► editor.dispatchTransaction(tr)   (ProseMirror applies state)
          │                        │
          │                        ▼
          │            'transaction' event ──► useSyncExternalStore notifies
          │                                         │  (deferred while composing)
          ▼                                         ▼
  view.updateState(state)                    React re-renders:
  = PURE staging on the view                 EditorContent → DocView → ChildNodeViews
  (nextProps, no DOM work)                     → NodeView/MarkView/Widget/DecoratedText
                                                    │
                                                    ▼
                                          React commits DOM (keyed by reactKeys,
                                          so unchanged nodes update in place)
                                                    │
                                                    ▼
                                       layout effects, children first:
                                       every desc refreshed + child walks
                                                    │
                                                    ▼
                                       EditorContent's commit effect:
                                       setDocView(desc) → commitPendingEffects()
                                       (base view applies staged props, updates
                                       plugin views, syncs the DOM selection)
```

The components render exactly what ProseMirror would: schema `toDOM` specs
become React elements (`OutputSpecView`, with `class`/`style` conversion in
`props.ts`); a `<p>` is a `<p>`, with no wrapper and no portal. `NodeView` is
a dispatcher — a component registered for the node's type (via
`EditorContent`'s `nodeViews` prop, carried by `EditorContext`) renders
through `ReactNodeView` with the node view contract (`node`, `getPos`,
`selected`, `updateAttributes`, `deleteNode`, `decorations`, `ref`,
`contentDOMRef`, `children`, …); otherwise `SchemaNodeView` renders the
`toDOM` spec. `MarkView`/`ReactMarkView` mirror this for marks.
`ChildNodeViews` nests inline children into shared mark elements exactly like
ProseMirror's inline DOM shape, and appends the trailing-`<br>` hack to empty
textblocks so contenteditable can target them.

## Input: the beforeInput plugin

With the mutation observer dead, ProseMirror can no longer diff DOM changes
back into transactions — so browser editing must be intercepted _before_ it
mutates the DOM. The `beforeInput` plugin handles `beforeinput`:
`insertText` (target-range aware, routed through `handleTextInput` so input
rules run), `insertParagraph`/`insertLineBreak` (as a synthetic Enter through
`handleKeyDown` so keymaps run), `insertReplacementText`, and the `delete*`
family. Every branch calls `event.preventDefault()` and dispatches a
transaction instead; React then renders the change. One subtlety:
`selectionchange` delivery is async, so the plugin flushes the pending DOM
selection read (`domObserver.flush()`, inert for mutations since the
observer is dead) before acting, making `state.selection` current.
`insertFromComposition` is deliberately _not_ prevented — see composition.

Keyboard shortcuts, clipboard, and drag/drop never reach this plugin: they
are handled by ProseMirror's own input listeners, which are still attached.

**Clipboard decision (Phase 7):** ProseMirror's clipboard pipeline works
unchanged. Copy serializes the selected slice through
`DOMSerializer.fromSchema` into a detached document — it never reads the
live document DOM — and paste parses clipboard HTML/text through the schema
parser. The desc-based `parseRule`/`parseRange` machinery is only consumed
by `readDOMChange`, which is dead along with the mutation observer.

## Stable identity: reactKeys

React must not remount a paragraph because its position shifted. The
`reactKeys` plugin assigns every node (text included) a stable key and maps
it forward through each transaction (`posToKey`/`keyToPos`); deleted nodes
drop out, new positions mint fresh keys. `ChildNodeViews` consumes the map
via `ReactKeysContext` as React `key`s, so React updates components in place
across edits. Meta support: `overrides` (explicit remaps, used by the
`reorderSiblings` command so keys survive moves — including descendants) and
`freezeFrom` (composition). Without a provider (static rendering), keys fall
back to indices.

Position mapping alone is not enough for transactions that rewrite content
wholesale — y-prosemirror applies every remote collab change as a
whole-document replace with freshly built nodes, which would drop every key
and remount the document. The plugin therefore runs an **orphaned-key rescue
pass**: keys whose positions were deleted re-attach to keyless new-doc nodes,
first by content identity (`node.eq`), then by a conservative positional zip,
so remote edits update in place and keys even survive cut-and-paste moves.

## Decorations

Decorations remain plugin state; React renders them:

- `viewDecorations(view, state)` collects every plugin's `decorations` prop
  into one `DecorationSource` (a derived `DecorationGroup`). `EditorContent`
  computes it per render — against the _rendered_ state, which can lag
  `view.state` during composition — and passes it down as `innerDeco`.
- `iterDeco` (derived) drives `ChildNodeViews`: it walks children and local
  decorations together, emitting widgets at their positions (ordered by
  `side`) and splitting text runs at inline-decoration boundaries.
- **Node decorations** become attributes merged onto the node's element
  (schema views via `renderOutputSpec`'s `rootProps`; React node views via
  `HTMLAttributes` plus the `decorations` prop).
- **Inline decorations** wrap text runs in nested elements
  (`DecoratedText`), with the run's `TextViewDesc` on the outermost wrapper
  and the real DOM text node as `nodeDOM` — the same DOM shape ProseMirror
  produces, so offsets map identically.
- **Widget decorations** render through `WidgetView`: decorations made with
  this package's `widget(pos, Component, spec)` helper render the component
  directly; native `toDOM` widgets get hosted inside a span (React cannot
  adopt live DOM). Both register a `WidgetViewDesc` (size 0) and honor
  `side`, `stopEvent`, `destroy`, and `spec.key`.

All private decoration API access (`deco.inline`/`widget` discriminators,
`type.side/attrs/spec/toDOM`, `source.locals()`) is confined to
`decorations/internals.ts`, documented per the derivation policy below.

## Composition (IME)

Compositions are fragile: React writing to (or even re-selecting around) the
composing text node cancels them. Three cooperating guards:

1. `EditorContent`'s subscription defers re-renders while `view.composing`,
   freezes its state snapshot (so a parent-triggered render can't smuggle new
   state past the deferral), and catches up on `compositionend` even when no
   further transaction arrives.
2. `ReactEditorView` wraps `domObserver.onSelectionChange` to no-op during
   composition.
3. The `beforeInput` plugin never flushes selection reads mid-composition and
   lets `insertFromComposition` proceed natively.

## Private internals policy

This package depends on non-public prosemirror-view behavior, pinned to an
exact version (see AUDIT.md §1-2; a compat test asserts the resolved version
and the shape of every symbol). Rules, enforced by convention:

- Every access goes through a small documented interface (e.g.
  `EditorViewInternals` in `ReactEditorView.ts`, `decorations/internals.ts`,
  `ViewSelectionInternals` in `viewdesc.ts`) stating the symbol, why, the
  invariant preserved, and the verified version.
- Derived modules (`viewdesc.ts`, `decorations/iterDeco.ts`,
  `decorations/viewDecorations.ts`, parts of `outerDeco.ts`) come from
  prosemirror-view's MIT source — never from third-party reimplementations —
  and stay structurally close to their origin on purpose; they are exempt
  from complexity linting for exactly that reason (`.fallowrc.json`).

## Invariants (things that must never happen)

- **The base class never renders or mutates document DOM** after
  construction. `NodeViewDesc.update()` returning true is what keeps
  `updateStateInner` off its redraw path; the observer being dead is what
  keeps DOM reads from becoming transactions.
- **`commitPendingEffects()` only runs with a registered doc view**, after a
  React commit whose DOM matches `nextProps.state`.
- **No `flushSync` on the render/commit path.** Dispatch stages state and
  notifies; rendering is normal React scheduling.
- **Desc identity is stable per component instance**; descs are mutated, not
  recreated, across commits (StrictMode-safe: effects re-assert the expando).
- **Every desc claims its DOM via `pmViewDesc`**, and parents rebuild their
  `children` arrays from the DOM on every commit — the desc tree is always a
  projection of what React actually rendered, never of what we _expect_ it
  to have rendered.

## Known boundaries

Registration of node/mark view components happens on `EditorContent`
(`nodeViews`/`markViews` props), not in extensions: `addNodeView()` returns
imperative constructors that assume view-owned DOM, and ExtensionManager
wraps them in fresh closures that cannot carry a component marker. Extensions
whose behavior lives in imperative node views (table's colgroup management,
details' toggle, image resize, mathematics' KaTeX) therefore degrade to their
schema rendering under this renderer until the migration bridge (Phase 14)
lands. Cursor-wrapper decorations, `widget.spec.marks`, and `nodeName`
renames on element decorations are documented gaps (TODO.md). Lifecycle
hardening (StrictMode double-mount of `useReactEditor`, multi-`EditorContent`
per editor) is Phase 9.
