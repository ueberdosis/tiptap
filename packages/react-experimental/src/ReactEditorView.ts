import type { EditorState } from '@tiptap/pm/state'
import type { DirectEditorProps } from '@tiptap/pm/view'
import { EditorView } from '@tiptap/pm/view'

import { EMPTY_STATE } from './constants.js'

/**
 * The subset of ProseMirror's `ViewDesc` surface the base `EditorView` calls
 * on its `docView` during `updateStateInner()` and `destroy()`. The React
 * renderer supplies an implementation backed by React-rendered DOM.
 */
export interface DocViewLike {
  matchesNode(node: unknown, outerDeco: unknown, innerDeco: unknown): boolean
  update(node: unknown, outerDeco: unknown, innerDeco: unknown, view: EditorView): boolean
  markDirty(from: number, to: number): void
  destroy(): void
}

/**
 * Non-public `prosemirror-view` internals this module relies on. They are
 * declared on `EditorView` but stripped from the published type declarations
 * (`@internal`), so every access goes through this interface via the
 * `internals()` helper below. Sibling modules with their own internal access
 * (each documented the same way): `viewdesc.ts` (`domSelectionRange`) and
 * `plugins/beforeInput.ts` (`input.lastIOSEnter`). AUDIT.md is the full
 * inventory to re-verify on any prosemirror-view bump.
 *
 * Each field is verified against prosemirror-view 1.41.9 (the pinned version,
 * see AUDIT.md):
 *
 * - `docView`: the position↔DOM mapping tree the base class renders in its
 *   constructor and consults in `updateStateInner()`/`destroy()`. We destroy
 *   the base-rendered one and later substitute a React-registered tree.
 *   Invariant: while `docView` is null, no base code path that dereferences it
 *   may run (`domObserver.flush()` and `destroy()` already early-return on a
 *   null `docView` in 1.41.9; we gate `commitPendingEffects()` ourselves).
 * - `domObserver.observer`: the `MutationObserver` watching `view.dom`.
 *   Nulling it keeps every future `domObserver.start()` from re-observing,
 *   so React's DOM mutations are never read back as input.
 * - `domObserver.queue`: mutation records pending processing. Cleared so
 *   nothing recorded during construction is ever flushed into
 *   `readDOMChange()`.
 * - `domObserver.onSelectionChange`: the bound `selectionchange` listener.
 *   `stop()`/`start()` remove/re-add the property's current value, so
 *   wrapping it here makes all future registrations composition-safe.
 *   Invariant: the wrapper must keep the original binding (it is already
 *   bound to the observer in the base constructor).
 * - `_props`: the base class's committed props. Only read in tests; writes
 *   happen exclusively through `super.update()`.
 */
interface EditorViewInternals {
  docView: DocViewLike | null
  domObserver: {
    observer: MutationObserver | null
    queue: MutationRecord[]
    onSelectionChange: () => void
    stop(): void
    start(): void
  }
  _props: DirectEditorProps
}

const internals = (view: EditorView): EditorViewInternals => view as unknown as EditorViewInternals

/**
 * Where the view attaches. Unlike the base `EditorView`, the element is always
 * used as the editable document element itself (ProseMirror's `{ mount }`
 * semantics) because React renders the document into it. Appending-container
 * (`place.appendChild`) and function placements are not supported.
 */
export type ReactEditorViewPlace = Element | { mount: HTMLElement }

const resolveMount = (place: ReactEditorViewPlace | null): HTMLElement => {
  const mount = place && 'mount' in place ? place.mount : place

  if (!(mount instanceof HTMLElement)) {
    throw new Error(
      '[tiptap error]: ReactEditorView requires an HTMLElement (or { mount }) to attach to. ' +
        'Function and null placements are not supported by the React renderer.',
    )
  }
  return mount
}

/**
 * Detaches all child nodes and attributes from the mount element and returns a
 * function restoring them. Used around base-class calls that render into or
 * clear the mount element, so DOM owned by React survives untouched.
 */
const detachMountContent = (mount: HTMLElement, includeAttributes: boolean) => {
  const childNodes = Array.from(mount.childNodes)
  childNodes.forEach(child => mount.removeChild(child))

  const attributes = includeAttributes ? Array.from(mount.attributes) : null
  attributes?.forEach(attribute => mount.removeAttribute(attribute.name))

  return () => {
    while (mount.firstChild) {
      mount.removeChild(mount.firstChild)
    }
    if (attributes) {
      Array.from(mount.attributes).forEach(attribute => mount.removeAttribute(attribute.name))
      attributes.forEach(attribute => mount.setAttribute(attribute.name, attribute.value))
    }
    childNodes.forEach(child => mount.appendChild(child))
  }
}

/**
 * An `EditorView` that never renders or mutates the document DOM. React owns
 * the document; ProseMirror keeps state, transactions, plugins, selection,
 * input handling, and geometry.
 *
 * Prop and state updates are pure: they are staged on `nextProps` and only
 * handed to the base class by `commitPendingEffects()`, which the React
 * integration calls in a layout effect after each commit — once the DOM
 * already matches the new state.
 */
export class ReactEditorView extends EditorView {
  /** The staged, uncommitted props. What the public `props` getter returns. */
  private nextProps: DirectEditorProps

  /** The state most recently committed to the base class. */
  private prevState: EditorState

  private destroyed: boolean

  // No initializer: the constructor's super() call sits inside try/finally,
  // and TS requires a root-level super() once initialized properties exist
  /** A selection read arrived while a commit was pending; run it after. */
  private pendingSelectionSync: boolean

  /** The observer's original bound selectionchange listener. */
  private baseOnSelectionChange!: () => void

  constructor(place: ReactEditorViewPlace, props: DirectEditorProps) {
    const mount = resolveMount(place)
    // The base constructor renders the (empty) doc into `mount`, removing
    // foreign children and rewriting attributes. Detach everything first and
    // restore it afterwards so React-owned DOM survives construction.
    const restoreMount = detachMountContent(mount, true)
    // When React rendered the document before the view is constructed, the
    // mount already carries its doc desc — the base constructor overwrites
    // that expando and destroying the base doc view clears it, so restore it
    // once the base doc view is gone.
    const previousDocDesc = mount.pmViewDesc

    try {
      // `plugins` is emptied so no plugin view is constructed against
      // EMPTY_STATE; plugin views initialize on the first commit instead.
      super({ mount }, { ...props, state: EMPTY_STATE, plugins: [] })
    } finally {
      restoreMount()
    }

    const self = internals(this)

    // Neutralize the DOM observer (see EditorViewInternals for invariants):
    // stop it, make future start() calls unable to observe, drop anything
    // recorded during construction, and gate selection reads on composition.
    // The observer is disconnected and nulled BEFORE stop(): with records
    // pending (the base constructor's rendering), stop() would schedule a
    // detached `setTimeout(flush, 20)` — a selection read we never want,
    // and one that can fire after the view's document is gone (verified
    // against 1.41.9: stop() only schedules it under `this.observer`).
    self.domObserver.observer?.disconnect()
    self.domObserver.observer = null
    self.domObserver.stop()
    self.domObserver.queue.length = 0
    this.baseOnSelectionChange = self.domObserver.onSelectionChange
    self.domObserver.onSelectionChange = () => {
      // Composition guard: Safari cancels an active composition even on a
      // no-op DOM selection write, so selection reads pause while composing.
      if (this.composing) {
        return
      }
      // Descs still describe the old DOM until React commits; defer the
      // read to the end of commitPendingEffects()
      if (this.hasPendingCommit) {
        this.pendingSelectionSync = true
        return
      }
      this.baseOnSelectionChange()
    }

    // The base class rendered a doc view for EMPTY_STATE; it must never touch
    // the document DOM again. React registers a replacement tree later.
    self.docView?.destroy()
    self.docView = null
    if (previousDocDesc) {
      mount.pmViewDesc = previousDocDesc
    }

    this.pendingSelectionSync = false
    this.nextProps = props
    // The state the base class actually committed is EMPTY_STATE; starting
    // there makes the first commit a real EMPTY_STATE -> props.state
    // transition, so plugin views initialize and the selection syncs.
    this.prevState = EMPTY_STATE
    this.destroyed = false
    // Expose the real state eagerly; the base class still holds EMPTY_STATE
    // in its committed props until the first commitPendingEffects().
    this.state = props.state
  }

  /**
   * Unlike the base getter, returns the staged (uncommitted) props, so
   * callers always observe the latest values between commits.
   */
  get props(): DirectEditorProps {
    if (this.nextProps.state !== this.state) {
      this.nextProps = { ...this.nextProps, state: this.state }
    }
    return this.nextProps
  }

  /**
   * Pure: stages the props and exposes the new state without touching the
   * DOM. The base class applies them in `commitPendingEffects()`.
   */
  update(props: DirectEditorProps): void {
    this.nextProps = props
    this.state = props.state
    // Mirrors the base class's module-private getEditable() so `editable`
    // stays current between commits.
    this.editable = !this.someProp('editable', value => value(this.state) === false)
  }

  setProps(props: Partial<DirectEditorProps>): void {
    this.update({ ...this.nextProps, state: this.state, ...props })
  }

  updateState(state: EditorState): void {
    this.update({ ...this.nextProps, state })
  }

  /**
   * Registers (or clears) the React-rendered doc desc as the view's document
   * tree. Called by the React integration whenever the root desc is
   * (re)registered; commits are no-ops until one is set.
   */
  setDocView(docView: DocViewLike | null): void {
    if (this.destroyed) {
      return
    }
    internals(this).docView = docView
  }

  /**
   * Applies the staged props to the base class. Must run after React has
   * committed DOM matching `props.state`, in a layout effect: the base class
   * then validates the DOM selection, updates plugin views, and fires
   * node-view selection callbacks against real DOM.
   */
  commitPendingEffects(): void {
    const self = internals(this)

    // Nothing to commit against until React has registered a doc view.
    if (this.destroyed || !self.docView) {
      return
    }

    // React renders stay frozen during composition; committing a staged
    // state now would write the DOM selection and cancel the IME
    if (this.composing) {
      return
    }

    const props = this.nextProps
    // Roll back the eagerly-set state so the base class observes the real
    // prevState -> props.state transition (plugin views receive the correct
    // previous state, selection comparison works).
    this.state = this.prevState
    self.docView.markDirty(-1, -1)
    super.update(props)
    this.prevState = this.state

    // Descs are fresh now: run the selection read deferred while the
    // commit was pending, so a racing user selection move still lands
    if (this.pendingSelectionSync) {
      this.pendingSelectionSync = false
      if (!this.composing) {
        this.baseOnSelectionChange()
      }
    }
  }

  /**
   * True while a dispatched state waits for React to commit its DOM. DOM
   * position reads must wait for `commitPendingEffects()` then.
   */
  get hasPendingCommit(): boolean {
    return this.state !== this.prevState
  }

  /** The base getter is `docView == null`, which is our resting state. */
  get isDestroyed(): boolean {
    return this.destroyed
  }

  destroy(): void {
    if (this.destroyed) {
      return
    }
    this.destroyed = true

    const self = internals(this)

    // The base destroy() early-returns when docView is null (skipping input
    // listener and plugin view cleanup) and would otherwise run its redraw
    // and teardown against our React-registered tree, whose lifecycle React
    // owns. Swap in an inert doc view so the base teardown runs fully without
    // touching the real tree.
    self.docView = {
      matchesNode: () => true,
      update: () => true,
      markDirty: () => undefined,
      destroy: () => undefined,
    }

    // Because the view was constructed with `{ mount }`, the base destroy()
    // clears `this.dom` — React-owned children. Detach and restore them so
    // React can unmount cleanly afterwards. Attributes are left alone
    // (destroy() does not touch them).
    const restoreMount = detachMountContent(this.dom, false)

    try {
      super.destroy()
    } finally {
      restoreMount()
    }
  }
}
