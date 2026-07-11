# Audit: React-owned rendering for Tiptap

Ground truth for building `@tiptap/react-experimental`, in which React owns the
editable document DOM while ProseMirror keeps state, transactions, plugins, commands,
selection, input handling, clipboard, and position/geometry APIs.

All file references and line numbers were verified against this repository and the installed
`prosemirror-view` source on 2026-07-07.

---

## 1. Pinned `prosemirror-view` version

**Pin: `prosemirror-view@1.41.9`** (MIT, © Marijn Haverbeke and others).

- `packages/pm/package.json` depends on `prosemirror-view: ^1.41.9`; the installed and
  verified version is exactly `1.41.9`.
- This package pins `prosemirror-view: 1.41.9` in `devDependencies`. At runtime all
  ProseMirror imports go through `@tiptap/pm/view` so there is exactly one
  `prosemirror-view` instance (class identity for `instanceof EditorView` must hold).
- A compatibility test asserting the resolved `prosemirror-view` version matches this pin
  lands with the first internals-touching code (Phase 2B). Bumping the pin requires
  re-verifying every symbol in section 2 against the new source.

## 2. Private `prosemirror-view` internals we expect to touch

Every symbol below was located in the installed `prosemirror-view@1.41.9` sources
(`packages/pm/node_modules/prosemirror-view/src`). Line numbers refer to those files.

### `EditorView` (`src/index.ts`)

| Symbol                                        | Where                                   | Why we touch it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docView: NodeViewDesc`                       | declared L49, built L87                 | Destroy the base-rendered doc view after `super()`; replace with our own React-registered `ViewDesc` tree. Built in the constructor via `docViewDesc(...)`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `_props: DirectEditorProps`                   | L32, committed in `update()` L126-128   | The base "committed props" member. We track `nextProps` ourselves and override the public `props` getter (L113-121) to return uncommitted props; `commitPendingEffects()` hands `nextProps` to `super.update()`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `input = new InputState`                      | L51                                     | Input/composition state. `get composing()` (L110) reads `this.input.composing`; the composition guard keys off it. Also `input.compositionNode` (L199) and `input.mouseDown` (L211). `plugins/beforeInput.ts` zeroes `input.lastIOSEnter` (L34). `plugins/composition.ts` takes over the composition edit handlers it suppresses: at compositionstart/update it sets `input.composing = true` and clears `input.composingTimeout` (the Android 5s compose-end timer must never fire mid-preedit, L515-553); at compositionend it writes `input.composing = false`, `input.compositionEndedAt = Date.now()` (matches 1.41.9's L563-565; newer prosemirror-view uses `event.timeStamp`, re-verify on bump), `input.compositionNode = null`, and clears `input.composingTimeout` again. |
| `cursorWrapper`                               | L43, set in `setCursorWrapper` ~L544    | The widget decoration ProseMirror places around composition/gap cursor; our renderer must render it in React.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `lastSelectedViewDesc: ViewDesc \| undefined` | L47                                     | Node-selection highlight bookkeeping; must be cleared/updated when React swaps DOM.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `domSelection(): DOMSelection \| null`        | L506                                    | Read the live DOM selection when syncing after commit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `domSelectionRange(): DOMSelectionRange`      | L498                                    | Same, with the Safari `getComposedRanges` shim.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `get isDestroyed()`                           | L479-481: `return this.docView == null` | **Trap:** because we null `docView`, the base getter would report destroyed. We must shadow `isDestroyed` with an own flag.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `updateStateInner` / `destroy()`              | L152+, L461+                            | `destroy()` calls `this.docView.destroy()` (L471) — teardown must tolerate our null/replaced `docView`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

### `DOMObserver` (`src/domobserver.ts`)

| Symbol                               | Where                                   | Why we touch it                                                                                                                                                                                                                                               |
| ------------------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `observer: MutationObserver \| null` | L42, created L52                        | Null it so the base class never observes React's DOM mutations.                                                                                                                                                                                               |
| `queue: MutationRecord[]`            | L40                                     | Clear it so no queued mutations get flushed into `readDOMChange`.                                                                                                                                                                                             |
| `onSelectionChange()`                | bound L80, listener L120/124, impl L132 | Wrap to no-op while `view.composing` (IME must not be disturbed by selectionchange reads) and to defer while a dispatched state awaits its React commit (descs would resolve stale positions); the deferred read runs at the end of `commitPendingEffects()`. |
| `stop()` / `start()`                 | L107-113 / L97-99                       | `stop()` after `super()` construction; the observer must stay stopped.                                                                                                                                                                                        |

All of these are non-public API. Per guardrail, every access site in our code gets a comment
naming the symbol, the reason, the invariant preserved, and "verified against 1.41.9". All
access is confined to `ReactEditorView.ts` (and the `viewdesc.ts` derivation).

### `viewdesc.ts` derivation

Our `ViewDesc` layer is derived from `prosemirror-view@1.41.9`'s `src/viewdesc.ts` (MIT) —
`ViewDesc` base, `NodeViewDesc`, `TextViewDesc`, `MarkViewDesc`, widget/composition/
trailing-hack descs, `posFromDOM`/`domFromPos`, `nodeDOM`, dirty tracking, and the DOM
expando (`pmViewDesc`) mapping. Not derived from any third-party reimplementation.

## 3. `@tiptap/core` integration surface

`packages/core/src/Editor.ts`:

- `createView()` (L532-578) hardcodes `this.editorView = new EditorView(element, {...})`
  (L547-559) with `attributes.role: 'textbox'`, composed `dispatchTransaction`,
  `transformPastedHTML`, `state`, `markViews`, `nodeViews`. This single construction site is
  what Phase 2A makes injectable (`__internalViewFactory`, internal, default preserves
  current behavior byte-for-byte).
- After construction, `createView()` reconfigures plugins, calls `this.view.updateState`,
  `prependClass()` (mutates `view.dom.className`, L597-599), `injectCSS()`, and stores the
  editor on `view.dom` (L575-577). All of this runs against whatever view the factory
  returned, so `ReactEditorView` must expose a real `dom` element by construction time.
- `mount(el)` / `unmount()` are public; the editor constructor only mounts when
  `options.element` is set. `get view()` returns a Proxy null-view while `editorView` is
  null (L307-350). We reuse this for pre-mount/SSR instead of a static view class.

## 4. Repo inventory: code that assumes ProseMirror-rendered DOM

Grep-verified inventory (source files under `packages/*/src`, excluding tests and legacy
`packages-deprecated`). Categories: **[dom]** reads/mutates `view.dom`; **[map]** uses
position-mapping APIs (`posAtDOM`, `domAtPos`, `nodeDOM`, `coordsAtPos`, `posAtCoords`) —
these keep working via our `ViewDesc` tree; **[marker]** depends on legacy wrapper markers
(`data-node-view-wrapper`, `.react-renderer`); **[mut]** directly mutates document DOM;
**[nv]** imperative `NodeView` constructor / `addNodeView` spec.

### Core

| File                                | Categories   | Notes                                                                                                                                                                                                                  |
| ----------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core/src/Editor.ts`                | dom, mut     | class prepend on `view.dom` (L597-599), `dom.editor = this` (L575-577), CSS injection into `document.head`, `unmount()` reads `view.dom`                                                                               |
| `core/src/commands/focus.ts`        | dom          | `(view.dom as HTMLElement).focus()` (L48, L56) — works as long as `view.dom` is the contenteditable root, which our renderer preserves                                                                                 |
| `core/src/commands/blur.ts`         | dom          | `(view.dom as HTMLElement).blur()` (L20) + `getSelection().removeAllRanges()`                                                                                                                                          |
| `core/src/NodeView.ts`              | dom, mut, nv | base class for framework node views; `get dom()` falls back to `view.dom` (L64); `onDragStart` clones node DOM and appends a drag image to `document.body` (L102-131); `contains()`-based `stopEvent`/`ignoreMutation` |
| `core/src/MarkView.ts`              | dom, nv      | `get dom()` returns `view.dom` (L78); `contains()`-based `ignoreMutation`                                                                                                                                              |
| `core/src/NodePos.ts`               | map          | `view.domAtPos(this.pos).node` (L31)                                                                                                                                                                                   |
| `core/src/helpers/posToDOMRect.ts`  | map          | `view.coordsAtPos` (L10-11) — geometry, safe with ViewDesc                                                                                                                                                             |
| `core/src/PasteRule.ts`             | dom          | drop-source detection via `view.dom.parentElement` (L262, L291)                                                                                                                                                        |
| `core/src/lib/ResizableNodeView.ts` | nv, mut      | imperative resizable node-view container                                                                                                                                                                               |

### Framework packages (legacy — must not regress)

| File                                                    | Categories           | Notes                                                                                                                |
| ------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `react/src/EditorContent.tsx`                           | dom, mut             | appends/moves `view.dom` under the React-rendered element; portal host                                               |
| `react/src/ReactNodeViewRenderer.tsx`                   | marker, mut, nv      | wrapper elements, `dataset.nodeViewWrapper`, `[data-node-view-content]` query, `contentDOMElement` creation          |
| `react/src/NodeViewWrapper.tsx` / `NodeViewContent.tsx` | marker               | render `data-node-view-wrapper` / `data-node-view-content`                                                           |
| `react/src/ReactMarkViewRenderer.tsx`                   | marker, mut, nv      | `data-mark-view-content`, contentDOM element creation                                                                |
| `react/src/ReactRenderer.tsx`                           | marker               | `.react-renderer` class on portal hosts                                                                              |
| `vue-2/src/*`, `vue-3/src/*`                            | dom, marker, mut, nv | same patterns as React (EditorContent, VueNodeViewRenderer, VueMarkViewRenderer, wrappers) — out of scope, untouched |

### Extensions

| File                                                                 | Categories       | Notes                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extension-bubble-menu/src/bubble-menu-plugin.ts`                    | dom, map, marker | `view.nodeDOM(selection.from)` (L322), **queries `[data-node-view-wrapper]` (L326)** — the one extension coupled to the legacy wrapper marker; appends menu to `view.dom.parentElement`                                                                                 |
| `extension-floating-menu/src/floating-menu-plugin.ts`                | dom, map         | positioning via `posToDOMRect`/`view.dom`                                                                                                                                                                                                                               |
| `extension-drag-handle/src/*` (plugin + helpers)                     | dom, map         | heaviest mapping-API consumer: `nodeDOM`, `posAtDOM`, `posAtCoords`, `domAtPos` across `drag-handle-plugin.ts`, `findNextElementFromCursor.ts`, `findBestDragTarget.ts`, `getDraggedBlockDir.ts`, `getInnerCoords.ts`, `scoring.ts` — a prime Phase 7 smoke-test target |
| `extension-details/src/details.ts`, `content/details-content.ts`     | nv, mut          | imperative `addNodeView` specs creating/toggling DOM directly                                                                                                                                                                                                           |
| `extension-details/src/helpers/isNodeVisible.ts`                     | map              | `view.domAtPos`                                                                                                                                                                                                                                                         |
| `extension-table/src/table/TableView.ts`, `table.ts`                 | nv, mut          | imperative `TableView` with colgroup `appendChild`/`removeChild` reconciliation                                                                                                                                                                                         |
| `extension-list/src/task-item/task-item.ts`                          | nv, mut          | `addNodeView` spec building checkbox DOM, `setAttribute` updates                                                                                                                                                                                                        |
| `extension-image/src/image.ts`                                       | nv               | `addNodeView` spec                                                                                                                                                                                                                                                      |
| `extension-mathematics/src/extensions/BlockMath.ts`, `InlineMath.ts` | nv               | `addNodeView` specs                                                                                                                                                                                                                                                     |
| `extension-link/src/helpers/clickHandler.ts`                         | dom              | constrains link lookup to `view.dom`                                                                                                                                                                                                                                    |
| `extension-table-of-contents/src/tableOfContents.ts`                 | map              | `view.domAtPos(headline.pos + 1)` (L48, L108)                                                                                                                                                                                                                           |
| `extension-node-range/src/node-range.ts`                             | dom              | `view.dom.classList.add(...)` (L94)                                                                                                                                                                                                                                     |
| `extension-mention/src/utils/get-default-suggestion-attributes.ts`   | dom              | `view.dom.ownerDocument.defaultView?.getSelection()`                                                                                                                                                                                                                    |
| `extension-file-handler/src/FileHandlePlugin.ts`                     | map              | `view.posAtCoords` for drop position (L33)                                                                                                                                                                                                                              |
| `extension-unique-id/src/unique-id.ts`                               | dom              | reads `view.dom`                                                                                                                                                                                                                                                        |
| `suggestion/src/helpers.ts`, `plugin/view.ts`                        | dom, map         | `view.dom.querySelector` for decoration element, `coordsAtPos`                                                                                                                                                                                                          |

**Implications.** [map]-only consumers keep working once the `ViewDesc` tree is faithful —
they are the mapping/selection matrices' test targets. [dom] consumers keep working as long
as `view.dom` remains the real contenteditable root (it does; React renders into it).
[marker] consumers (bubble-menu's `[data-node-view-wrapper]` query) need a fallback path
since the new renderer produces no wrappers. [nv]/[mut] imperative node views are the
Phase 14 bridge scope; direct-mutation views (table colgroup, details toggle, task-item
checkbox) conflict with React-owned children and must be documented or bridged.

## 5. Core commands and view-owned-DOM assumptions

Verdicts for the candidates named in the runbook:

- `updateAttributes` — **safe.** Pure transaction code (`tr.setNodeMarkup` / `tr.addMark`);
  no view or DOM access. The competing Tiptap adapter's replacement command set is not
  needed for this command in our integration.
- `focus` — **at-risk but compatible.** Calls `(view.dom as HTMLElement).focus()` for
  iOS/WebView cases and `view.focus()` otherwise. `view.focus()` in 1.41.9 calls
  `domObserver.stop()/start()` (no-ops once neutralized) and `setSelectionToDOM`; works if
  selection sync via our desc tree is correct.
- `blur` — **at-risk but compatible.** Same shape as focus.
- `scrollIntoView`, `selectTextblockStart/End`, `deleteCurrentNode`, `deleteSelection`,
  etc. — **safe.** Transaction/state level only.
- `Editor.prependClass()` — mutates `view.dom.className` once at creation; compatible since
  React renders _into_ `view.dom`, not around it, and doc-level attributes are handled via
  outer decorations (`computeDocDeco` equivalent) which must merge rather than clobber.
- `NodeView.onDragStart` (core base class) — **at-risk.** Clones the node's DOM for the
  drag image; with React-owned DOM the clone works but assumes the node's `dom` reference
  is current. Covered by Phase 11 drag/drop tests.

## 6. Known traps (recorded for later phases)

- `isDestroyed` is `docView == null` in 1.41.9 — must be shadowed (section 2).
- `createView()` calls `this.view.updateState(...)` and `dom.editor = this` immediately
  after the factory returns, so `ReactEditorView` must be fully constructed (real `dom`,
  observer stopped, docView destroyed) before returning from the factory.
- Changesets uses a fixed version group for `@tiptap/*`; this package stays `private` until
  Phase 8 to keep it out of release trains, then adopts the fixed version.
- `pnpm-workspace.yaml` globs `packages/*`, so the package is picked up with no config
  changes anywhere else.
