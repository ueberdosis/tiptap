/**
 * Derived from prosemirror-view's `src/viewdesc.ts` and `src/dom.ts`
 * (MIT, Copyright (C) 2015-2017 by Marijn Haverbeke <marijn@haverbeke.berlin>
 * and others), reduced to the position<->DOM mapping layer. Rendering,
 * parsing, and child reconciliation stay out: React owns the document DOM, so
 * descs are registered against React-rendered elements instead of creating
 * DOM themselves.
 *
 * Semantics are kept aligned with the pinned prosemirror-view 1.41.9 (see
 * AUDIT.md) because the base `EditorView` walks this tree through `docView`
 * and the `pmViewDesc` expando for `posAtDOM`/`domAtPos`/`nodeDOM`, selection
 * reading, and input handling.
 */
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource, EditorView } from '@tiptap/pm/view'

import { gecko, safari } from './browser.js'

export const NOT_DIRTY = 0
export const CHILD_DIRTY = 1
export const CONTENT_DIRTY = 2
export const NODE_DIRTY = 3

/**
 * Non-public `EditorView` members the derived selection code reads, verified
 * against prosemirror-view 1.41.9 (both are declared `@internal` and stripped
 * from the published types):
 *
 * - `domSelectionRange()`: the current DOM selection, normalized for Safari
 *   shadow-DOM quirks. Read-only; the invariant is that `setSelection` only
 *   compares against it before writing through `view.root.getSelection()`.
 */
interface ViewSelectionInternals {
  domSelectionRange(): {
    focusNode: Node | null
    focusOffset: number
    anchorNode: Node | null
    anchorOffset: number
  }
}

const selectionInternals = (view: EditorView): ViewSelectionInternals =>
  view as unknown as ViewSelectionInternals

declare global {
  interface Node {
    /**
     * The expando linking a DOM node back to its description. The property
     * name must match prosemirror-view's, because the base `EditorView`'s
     * input and selection code looks descs up through it. (The published
     * prosemirror-view types declare the augmentation but strip the member,
     * so this declaration does not conflict.)
     */
    pmViewDesc?: ViewDesc
  }
}

/** Position of a DOM node within its parent's `childNodes`. */
export const domIndex = (node: Node): number => {
  let index = 0
  let current: Node | null = node

  for (;;) {
    current = current.previousSibling
    if (!current) {
      return index
    }
    index += 1
  }
}

const nodeSize = (node: Node): number =>
  node.nodeType === 3 ? (node.nodeValue?.length ?? 0) : node.childNodes.length

const hasBlockDesc = (dom: Node): boolean => {
  let desc: ViewDesc | undefined

  for (let cur: Node | null = dom; cur; cur = cur.parentNode) {
    desc = cur.pmViewDesc
    if (desc) {
      break
    }
  }
  return Boolean(
    desc && desc.node && desc.node.isBlock && (desc.dom === dom || desc.contentDOM === dom),
  )
}

const ATOM_ELEMENTS = /^(img|br|input|textarea|hr)$/i

const scanFor = (
  node: Node,
  off: number,
  targetNode: Node,
  targetOff: number,
  dir: number,
): boolean => {
  let current = node
  let offset = off

  for (;;) {
    if (current === targetNode && offset === targetOff) {
      return true
    }
    if (offset === (dir < 0 ? 0 : nodeSize(current))) {
      const parent = current.parentNode

      if (
        !parent ||
        parent.nodeType !== 1 ||
        hasBlockDesc(current) ||
        ATOM_ELEMENTS.test(current.nodeName) ||
        (current as HTMLElement).contentEditable === 'false'
      ) {
        return false
      }
      offset = domIndex(current) + (dir < 0 ? 0 : 1)
      current = parent
    } else if (current.nodeType === 1) {
      const child = current.childNodes[offset + (dir < 0 ? -1 : 0)]

      if (child.nodeType === 1 && (child as HTMLElement).contentEditable === 'false') {
        if (child.pmViewDesc?.ignoreForSelection) {
          offset += dir
        } else {
          return false
        }
      } else {
        current = child
        offset = dir < 0 ? nodeSize(current) : 0
      }
    } else {
      return false
    }
  }
}

/**
 * Whether two DOM positions are equivalent (e.g. after a text node vs at the
 * end of that text node). Derived from prosemirror-view 1.41.9's `dom.ts`.
 */
const isEquivalentPosition = (
  node: Node,
  off: number,
  targetNode: Node | null,
  targetOff: number,
): boolean =>
  Boolean(
    targetNode &&
    (scanFor(node, off, targetNode, targetOff, -1) || scanFor(node, off, targetNode, targetOff, 1)),
  )

const sameOuterDeco = (a: readonly Decoration[], b: readonly Decoration[]): boolean => {
  if (a.length !== b.length) {
    return false
  }
  // Decoration.eq is @internal but stable in 1.41.9; mirror of viewdesc.ts's
  // sameOuterDeco
  return a.every((deco, i) => (deco as unknown as { eq(other: Decoration): boolean }).eq(b[i]))
}

/**
 * A description of a DOM structure. There is one for the document, and one
 * for every node and (later) mark and widget in it. They form a mutable tree
 * mapping document positions to DOM and back.
 */
export class ViewDesc {
  public dirty: number = NOT_DIRTY

  declare node: ProseMirrorNode | null

  constructor(
    public parent: ViewDesc | undefined,
    public children: ViewDesc[],
    public dom: Node,
    /** The node holding the child views; null for descs without children. */
    public contentDOM: HTMLElement | null,
  ) {
    dom.pmViewDesc = this
  }

  matchesWidget(_widget: Decoration): boolean {
    return false
  }

  matchesMark(_mark: unknown): boolean {
    return false
  }

  matchesNode(
    _node: ProseMirrorNode,
    _outerDeco: readonly Decoration[],
    _innerDeco: DecorationSource,
  ): boolean {
    return false
  }

  matchesHack(_nodeName: string): boolean {
    return false
  }

  stopEvent(_event: Event): boolean {
    return false
  }

  /** The size of the content represented by this desc. */
  get size(): number {
    return this.children.reduce((size, child) => size + child.size, 0)
  }

  /** For block nodes, the space taken up by their start/end tokens. */
  get border(): number {
    return 0
  }

  destroy(): void {
    this.parent = undefined
    if (this.dom.pmViewDesc === this) {
      this.dom.pmViewDesc = undefined
    }
    this.children.forEach(child => child.destroy())
  }

  posBeforeChild(child: ViewDesc): number {
    let pos = this.posAtStart

    for (const current of this.children) {
      if (current === child) {
        return pos
      }
      pos += current.size
    }
    throw new RangeError('Child ViewDesc not found in parent')
  }

  get posBefore(): number {
    if (!this.parent) {
      throw new RangeError('ViewDesc without parent has no posBefore')
    }
    return this.parent.posBeforeChild(this)
  }

  get posAtStart(): number {
    return this.parent ? this.parent.posBeforeChild(this) + this.border : 0
  }

  get posAfter(): number {
    return this.posBefore + this.size
  }

  get posAtEnd(): number {
    return this.posAtStart + this.size - 2 * this.border
  }

  localPosFromDOM(dom: Node, offset: number, bias: number): number {
    // If the DOM position is in the content, use the child desc around it to
    // determine a position
    if (this.contentDOM && this.contentDOM.contains(dom.nodeType === 1 ? dom : dom.parentNode)) {
      if (bias < 0) {
        let domBefore: Node | null
        let desc: ViewDesc | undefined

        if (dom === this.contentDOM) {
          domBefore = dom.childNodes[offset - 1] ?? null
        } else {
          let scan = dom
          while (scan.parentNode !== this.contentDOM) {
            scan = scan.parentNode as Node
          }
          domBefore = scan.previousSibling
        }
        while (domBefore) {
          desc = domBefore.pmViewDesc
          if (desc && desc.parent === this) {
            return this.posBeforeChild(desc) + desc.size
          }
          domBefore = domBefore.previousSibling
        }
        return this.posAtStart
      }

      let domAfter: Node | null
      let desc: ViewDesc | undefined

      if (dom === this.contentDOM) {
        domAfter = dom.childNodes[offset] ?? null
      } else {
        let scan = dom
        while (scan.parentNode !== this.contentDOM) {
          scan = scan.parentNode as Node
        }
        domAfter = scan.nextSibling
      }
      while (domAfter) {
        desc = domAfter.pmViewDesc
        if (desc && desc.parent === this) {
          return this.posBeforeChild(desc)
        }
        domAfter = domAfter.nextSibling
      }
      return this.posAtEnd
    }

    // Otherwise, use heuristics (falling back on `bias`) to decide between
    // the start and end position of this desc
    let atEnd: boolean | undefined

    if (dom === this.dom && this.contentDOM) {
      atEnd = offset > domIndex(this.contentDOM)
    } else if (
      this.contentDOM &&
      this.contentDOM !== this.dom &&
      this.dom.contains(this.contentDOM)
    ) {
      atEnd = Boolean(dom.compareDocumentPosition(this.contentDOM) & 2)
    } else if (this.dom.firstChild) {
      if (offset === 0) {
        for (let search: Node = dom; ; search = search.parentNode as Node) {
          if (search === this.dom) {
            atEnd = false
            break
          }
          if (search.previousSibling) {
            break
          }
        }
      }
      if (atEnd === undefined && offset === dom.childNodes.length) {
        for (let search: Node = dom; ; search = search.parentNode as Node) {
          if (search === this.dom) {
            atEnd = true
            break
          }
          if (search.nextSibling) {
            break
          }
        }
      }
    }

    return (atEnd === undefined ? bias > 0 : atEnd) ? this.posAtEnd : this.posAtStart
  }

  /** Scan up the DOM for the first desc that is a descendant of this one. */
  nearestDesc(dom: Node): ViewDesc | undefined
  nearestDesc(dom: Node, onlyNodes: true): NodeViewDesc | undefined
  nearestDesc(dom: Node, onlyNodes = false): ViewDesc | undefined {
    let first = true

    for (let cur: Node | null = dom; cur; cur = cur.parentNode) {
      const desc = this.getDesc(cur)

      if (desc && (!onlyNodes || desc.node)) {
        // If dom is outside of this desc's nodeDOM, don't count it
        const nodeDOM = (desc as NodeViewDesc).nodeDOM

        if (
          first &&
          nodeDOM &&
          !(nodeDOM.nodeType === 1
            ? nodeDOM.contains(dom.nodeType === 1 ? dom : dom.parentNode)
            : nodeDOM === dom)
        ) {
          first = false
        } else {
          return desc
        }
      }
    }
    return undefined
  }

  getDesc(dom: Node): ViewDesc | undefined {
    const desc = dom.pmViewDesc

    for (let cur: ViewDesc | undefined = desc; cur; cur = cur.parent) {
      if (cur === this) {
        return desc
      }
    }
    return undefined
  }

  posFromDOM(dom: Node, offset: number, bias: number): number {
    for (let scan: Node | null = dom; scan; scan = scan.parentNode) {
      const desc = this.getDesc(scan)

      if (desc) {
        return desc.localPosFromDOM(dom, offset, bias)
      }
    }
    return -1
  }

  /** Find the desc for the node after the given pos, if any. */
  descAt(pos: number): ViewDesc | undefined {
    let offset = 0

    for (let child of this.children) {
      const end = offset + child.size

      if (offset === pos && end !== offset) {
        while (!child.border && child.children.length) {
          const inner = child.children.find(c => c.size > 0)

          if (!inner) {
            break
          }
          child = inner
        }
        return child
      }
      if (pos < end) {
        return child.descAt(pos - offset - child.border)
      }
      offset = end
    }
    return undefined
  }

  domFromPos(pos: number, side: number): { node: Node; offset: number; atom?: number } {
    if (!this.contentDOM) {
      return { node: this.dom, offset: 0, atom: pos + 1 }
    }

    // First find the position in the child array
    let i = 0
    let offset = 0

    for (let curPos = 0; i < this.children.length; i++) {
      const child = this.children[i]
      const end = curPos + child.size

      if (end > pos || child.isTrailingHack) {
        offset = pos - curPos
        break
      }
      curPos = end
    }
    // If this points into the middle of a child, call through
    if (offset) {
      return this.children[i].domFromPos(offset - this.children[i].border, side)
    }
    // Go back past any zero-length widgets with side >= 0 before this point
    for (let prev: ViewDesc; i > 0; i--) {
      prev = this.children[i - 1]
      if (prev.size || prev.widgetSide === null || prev.widgetSide < 0) {
        break
      }
    }
    // Scan towards the first usable node
    if (side <= 0) {
      let prev: ViewDesc | null = null
      let enter = true

      for (; ; i--, enter = false) {
        prev = i > 0 ? this.children[i - 1] : null
        if (!prev || prev.dom.parentNode === this.contentDOM) {
          break
        }
      }
      if (prev && side && enter && !prev.border && !prev.domAtom) {
        return prev.domFromPos(prev.size, side)
      }
      return { node: this.contentDOM, offset: prev ? domIndex(prev.dom) + 1 : 0 }
    }

    let next: ViewDesc | null = null
    let enter = true

    for (; ; i++, enter = false) {
      next = i < this.children.length ? this.children[i] : null
      if (!next || next.dom.parentNode === this.contentDOM) {
        break
      }
    }
    if (next && enter && !next.border && !next.domAtom) {
      return next.domFromPos(0, side)
    }
    return {
      node: this.contentDOM,
      offset: next ? domIndex(next.dom) : this.contentDOM.childNodes.length,
    }
  }

  domAfterPos(pos: number): Node {
    const { node, offset } = this.domFromPos(pos, 0)

    if (node.nodeType !== 1 || offset === node.childNodes.length) {
      throw new RangeError(`No node after pos ${pos}`)
    }
    return node.childNodes[offset]
  }

  /**
   * Writes the given document selection to the DOM. Descs own any selection
   * falling entirely inside of them (so custom node views can override this);
   * a selection spanning descs is applied here via `domFromPos` best effort.
   * Derived from prosemirror-view 1.41.9, browser kludges included.
   */
  setSelection(anchor: number, head: number, view: EditorView, force = false): void {
    // If the selection falls entirely in a child, give it to that child
    const from = Math.min(anchor, head)
    const to = Math.max(anchor, head)
    let offset = 0

    for (const child of this.children) {
      const end = offset + child.size

      if (from > offset && to < end) {
        return child.setSelection(
          anchor - offset - child.border,
          head - offset - child.border,
          view,
          force,
        )
      }
      offset = end
    }

    let anchorDOM = this.domFromPos(anchor, anchor ? -1 : 1)
    let headDOM = head === anchor ? anchorDOM : this.domFromPos(head, head ? -1 : 1)
    const domSel = (view.root as Document).getSelection()

    if (!domSel) {
      return
    }

    const selRange = selectionInternals(view).domSelectionRange()
    let mustForce = force
    let brKludge = false

    // On Firefox, Selection.collapse after a BR does not always work (PM
    // #1073); on Safari the cursor can visually lag behind its reported
    // position there (PM #1092)
    if ((gecko || safari) && anchor === head) {
      const { node, offset: anchorOffset } = anchorDOM

      if (node.nodeType === 3) {
        brKludge = Boolean(anchorOffset && node.nodeValue?.[anchorOffset - 1] === '\n')
        // PM #1128
        if (brKludge && anchorOffset === node.nodeValue?.length) {
          for (let scan: Node | null = node; scan; scan = scan.parentNode) {
            const after = scan.nextSibling

            if (after) {
              if (after.nodeName === 'BR') {
                anchorDOM = headDOM = {
                  node: after.parentNode as Node,
                  offset: domIndex(after) + 1,
                }
              }
              break
            }
            const desc = scan.pmViewDesc

            if (desc && desc.node && desc.node.isBlock) {
              break
            }
          }
        }
      } else {
        const prev = node.childNodes[anchorOffset - 1]

        brKludge = Boolean(
          prev && (prev.nodeName === 'BR' || (prev as HTMLElement).contentEditable === 'false'),
        )
      }
    }
    // Firefox can act strangely when the selection sits in front of an
    // uneditable node (PM #1163)
    if (
      gecko &&
      selRange.focusNode &&
      selRange.focusNode !== headDOM.node &&
      selRange.focusNode.nodeType === 1
    ) {
      const after = selRange.focusNode.childNodes[selRange.focusOffset]

      if (after && (after as HTMLElement).contentEditable === 'false') {
        mustForce = true
      }
    }

    if (
      !(mustForce || (brKludge && safari)) &&
      isEquivalentPosition(
        anchorDOM.node,
        anchorDOM.offset,
        selRange.anchorNode,
        selRange.anchorOffset,
      ) &&
      isEquivalentPosition(headDOM.node, headDOM.offset, selRange.focusNode, selRange.focusOffset)
    ) {
      return
    }

    // Selection.extend can create an inverted selection (focus before
    // anchor); fall back to a Range where it fails or is unavailable
    let domSelExtended = false

    if ((domSel.extend || anchor === head) && !(brKludge && gecko)) {
      domSel.collapse(anchorDOM.node, anchorDOM.offset)
      try {
        if (anchor !== head) {
          domSel.extend(headDOM.node, headDOM.offset)
        }
        domSelExtended = true
      } catch {
        // Chrome can leave the selection empty after collapse; Safari can
        // throw when the editor is hidden with no selection. Fall through.
      }
    }
    if (!domSelExtended) {
      if (anchor > head) {
        const tmp = anchorDOM

        anchorDOM = headDOM
        headDOM = tmp
      }
      const range = document.createRange()

      range.setEnd(headDOM.node, headDOM.offset)
      range.setStart(anchorDOM.node, anchorDOM.offset)
      domSel.removeAllRanges()
      domSel.addRange(range)
    }
  }

  get contentLost(): boolean {
    return Boolean(
      this.contentDOM && this.contentDOM !== this.dom && !this.dom.contains(this.contentDOM),
    )
  }

  /**
   * Mark a subtree touched by a change as dirty, so the next update knows it
   * cannot be trusted to match its node.
   */
  markDirty(from: number, to: number): void {
    let offset = 0

    for (const child of this.children) {
      const end = offset + child.size
      const touches = offset === end ? from <= end && to >= offset : from < end && to > offset

      if (touches) {
        const startInside = offset + child.border
        const endInside = end - child.border

        if (from >= startInside && to <= endInside) {
          this.dirty = from === offset || to === end ? CONTENT_DIRTY : CHILD_DIRTY
          if (
            from === startInside &&
            to === endInside &&
            (child.contentLost || child.dom.parentNode !== this.contentDOM)
          ) {
            child.dirty = NODE_DIRTY
          } else {
            child.markDirty(from - startInside, to - startInside)
          }
          return
        }
        child.dirty =
          child.dom === child.contentDOM &&
          child.dom.parentNode === this.contentDOM &&
          !child.children.length
            ? CONTENT_DIRTY
            : NODE_DIRTY
      }
      offset = end
    }
    this.dirty = CONTENT_DIRTY
  }

  markParentsDirty(): void {
    let level = 1

    for (let node = this.parent; node; node = node.parent, level += 1) {
      const dirty = level === 1 ? CONTENT_DIRTY : CHILD_DIRTY

      if (node.dirty < dirty) {
        node.dirty = dirty
      }
    }
  }

  get domAtom(): boolean {
    return false
  }

  get ignoreForCoords(): boolean {
    return false
  }

  get ignoreForSelection(): boolean {
    return false
  }

  /**
   * The `side` of the widget decoration this desc renders, or null when it is
   * not a widget. Base descs are never widgets; the widget desc added in a
   * later phase overrides this.
   */
  get widgetSide(): number | null {
    return null
  }

  /** Whether this desc is a trailing-break/separator hack node. */
  get isTrailingHack(): boolean {
    return false
  }

  isText(_text: string): boolean {
    return false
  }
}

/**
 * A desc for a document node (including the doc itself). Unlike
 * prosemirror-view's, it never creates DOM: `dom`, `contentDOM`, and
 * `nodeDOM` reference React-rendered elements.
 */
export class NodeViewDesc extends ViewDesc {
  constructor(
    parent: ViewDesc | undefined,
    public node: ProseMirrorNode,
    public outerDeco: readonly Decoration[],
    public innerDeco: DecorationSource,
    dom: Node,
    contentDOM: HTMLElement | null,
    public nodeDOM: Node,
  ) {
    super(parent, [], dom, contentDOM)
  }

  matchesNode(
    node: ProseMirrorNode,
    outerDeco: readonly Decoration[],
    innerDeco: DecorationSource,
  ): boolean {
    // DecorationSource.eq is @internal but present on both implementations in
    // 1.41.9 (DecorationSet and DecorationGroup)
    const innerDecoEq = (innerDeco as unknown as { eq(other: DecorationSource): boolean }).eq

    return (
      this.dirty === NOT_DIRTY &&
      node.eq(this.node) &&
      sameOuterDeco(outerDeco, this.outerDeco) &&
      innerDecoEq.call(innerDeco, this.innerDeco)
    )
  }

  /**
   * Accepts the given node and refreshes the desc's fields. Unlike
   * prosemirror-view's, this never rejects and never reconciles children or
   * patches outer-decoration DOM: it runs from `commitPendingEffects()`
   * after React has already rendered the node (per-node layout effects
   * refreshed the child descs), so even a markup change is already in the
   * DOM. Returning false would send the base class down its redraw path,
   * which destroys this desc tree and renders ProseMirror-owned DOM into
   * the React-owned mount; that must never happen.
   */
  update(
    node: ProseMirrorNode,
    outerDeco: readonly Decoration[],
    innerDeco: DecorationSource,
    _view: EditorView,
  ): boolean {
    this.node = node
    this.outerDeco = outerDeco
    this.innerDeco = innerDeco
    this.dirty = NOT_DIRTY
    return true
  }

  /**
   * Records the outer decorations without touching the DOM; React renders
   * them as attributes (Phase 6). Only called by the base class on the
   * redraw path, which `update()` returning true prevents.
   */
  updateOuterDeco(outerDeco: readonly Decoration[]): void {
    this.outerDeco = outerDeco
  }

  /** Marks this node as the DOM-selected node. */
  selectNode(): void {
    if (this.nodeDOM.nodeType === 1) {
      const element = this.nodeDOM as HTMLElement

      element.classList.add('ProseMirror-selectednode')
      if (this.contentDOM || !this.node.type.spec.draggable) {
        element.draggable = true
      }
    }
  }

  /** Removes the DOM-selected marking again. */
  deselectNode(): void {
    if (this.nodeDOM.nodeType === 1) {
      const element = this.nodeDOM as HTMLElement

      element.classList.remove('ProseMirror-selectednode')
      if (this.contentDOM || !this.node.type.spec.draggable) {
        element.removeAttribute('draggable')
      }
    }
  }

  get size(): number {
    return this.node.nodeSize
  }

  get border(): number {
    return this.node.isLeaf ? 0 : 1
  }

  get domAtom(): boolean {
    return this.node.isAtom
  }
}

/** A desc for a text node. Its `nodeDOM` is the actual DOM `Text` node. */
export class TextViewDesc extends NodeViewDesc {
  constructor(
    parent: ViewDesc | undefined,
    node: ProseMirrorNode,
    outerDeco: readonly Decoration[],
    innerDeco: DecorationSource,
    dom: Node,
    nodeDOM: Node,
  ) {
    super(parent, node, outerDeco, innerDeco, dom, null, nodeDOM)
  }

  domFromPos(pos: number): { node: Node; offset: number } {
    return { node: this.nodeDOM, offset: pos }
  }

  localPosFromDOM(dom: Node, offset: number, bias: number): number {
    if (dom === this.nodeDOM) {
      return this.posAtStart + Math.min(offset, this.node.text?.length ?? 0)
    }
    return super.localPosFromDOM(dom, offset, bias)
  }

  inParent(): boolean {
    const parentDOM = this.parent?.contentDOM

    for (let n: Node | null = this.nodeDOM; n; n = n.parentNode) {
      if (n === parentDOM) {
        return true
      }
    }
    return false
  }

  markDirty(from: number, to: number): void {
    super.markDirty(from, to)
    if (this.dom !== this.nodeDOM && (from === 0 || to === (this.nodeDOM.nodeValue?.length ?? 0))) {
      this.dirty = NODE_DIRTY
    }
  }

  get domAtom(): boolean {
    return false
  }

  isText(text: string): boolean {
    return this.node.text === text
  }
}
