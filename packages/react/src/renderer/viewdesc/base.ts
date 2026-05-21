/**
 * Base descriptor class. Owns the DOM↔doc position translations
 * (`localPosFromDOM`, `domFromPos`, `nearestDesc`, etc.) that
 * PM-view's other modules call on `view.docView`.
 *
 * The write methods (`update`, `markDirty`, `destroy`, …) are
 * no-ops here — React owns the DOM, so we have nothing to redraw.
 */

import type { Mark, Node as PMNode, TagParseRule } from '@tiptap/pm/model'
import type { Decoration, DecorationSource, EditorView, ViewMutationRecord } from '@tiptap/pm/view'

import { type DOMNode, CHILD_DIRTY, CONTENT_DIRTY, NOT_DIRTY } from './types.js'

/** Position of `node` inside `node.parentNode.childNodes`. */
function domIndex(node: DOMNode): number {
  let index = 0
  let cur: DOMNode | null = node.previousSibling
  while (cur) {
    index += 1
    cur = cur.previousSibling
  }
  return index
}

/** True when `target` is inside the given `nodeDOM` element. */
function isInsideNodeDOM(nodeDOM: DOMNode | undefined, dom: DOMNode, target: DOMNode | null): boolean {
  if (!nodeDOM) {
    return true
  }
  if (nodeDOM.nodeType === 1) {
    return (nodeDOM as HTMLElement).contains(target)
  }
  return nodeDOM === dom
}

export class ReactViewDesc {
  dirty: number = NOT_DIRTY

  /** PM node represented, or `null` for marks/widgets/hacks. */
  node: PMNode | null = null

  constructor(
    public parent: ReactViewDesc | undefined,
    public children: ReactViewDesc[],
    public dom: DOMNode,
    /** Element holding child descs. `null` on leaves. */
    public contentDOM: HTMLElement | null,
  ) {
    dom.pmViewDesc = this
  }

  // Matchers — subclasses override the ones that apply.

  matchesWidget(_widget: Decoration): boolean {
    return false
  }

  matchesMark(_mark: Mark): boolean {
    return false
  }

  matchesNode(_node: PMNode, _outerDeco: readonly Decoration[], _innerDeco: DecorationSource): boolean {
    return false
  }

  matchesHack(_nodeName: string): boolean {
    return false
  }

  parseRule(): Omit<TagParseRule, 'tag'> | null {
    return null
  }

  stopEvent(_event: Event): boolean {
    return false
  }

  ignoreMutation(_mutation: ViewMutationRecord): boolean {
    return false
  }

  // Size / position getters.

  get size(): number {
    let size = 0
    for (let i = 0; i < this.children.length; i += 1) {
      size += this.children[i]!.size
    }
    return size
  }

  /** Token width of the desc's borders (`1` for block-level nodes, else `0`). */
  get border(): number {
    return 0
  }

  /** Whether `domFromPos` should treat this desc as indivisible. */
  get domAtom(): boolean {
    return false
  }

  /** Set on widgets that opt out of selection-sync. */
  get ignoreForSelection(): boolean {
    return false
  }

  /** Widget binding side, or `null` if not a widget. Replaces `instanceof` checks. */
  get widgetSide(): number | null {
    return null
  }

  /** True for the trailing-`<br>` hack. Replaces `instanceof` checks. */
  get isTrailingHack(): boolean {
    return false
  }

  get posBefore(): number {
    return this.parent!.posBeforeChild(this)
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

  posBeforeChild(child: ReactViewDesc): number {
    let pos = this.posAtStart
    for (let i = 0; i < this.children.length; i += 1) {
      const cur = this.children[i]!
      if (cur === child) {
        return pos
      }
      pos += cur.size
    }
    throw new Error('ReactViewDesc.posBeforeChild: child not found in this desc')
  }

  // Read methods — translate between DOM and document positions.
  // Ported from prosemirror-view; same semantics, our naming.

  /** DOM position → doc position inside this desc. */
  localPosFromDOM(dom: DOMNode, offset: number, bias: number): number {
    const insideContent = this.contentDOM && this.contentDOM.contains(dom.nodeType === 1 ? dom : dom.parentNode)

    if (insideContent) {
      if (bias < 0) {
        return this.posOnContentSide(dom, offset, -1)
      }
      return this.posOnContentSide(dom, offset, 1)
    }

    return this.snapsToEnd(dom, offset, bias) ? this.posAtEnd : this.posAtStart
  }

  private posOnContentSide(dom: DOMNode, offset: number, side: -1 | 1): number {
    let neighbor: DOMNode | null
    if (dom === this.contentDOM) {
      neighbor = this.contentDOM.childNodes[side < 0 ? offset - 1 : offset] ?? null
    } else {
      let cur: DOMNode = dom
      while (cur.parentNode !== this.contentDOM) {
        cur = cur.parentNode!
      }
      neighbor = side < 0 ? cur.previousSibling : cur.nextSibling
    }

    // Skip siblings whose desc isn't owned by us.
    let desc: ReactViewDesc | undefined
    while (neighbor) {
      desc = neighbor.pmViewDesc
      if (desc && desc.parent === this) {
        break
      }
      neighbor = side < 0 ? neighbor.previousSibling : neighbor.nextSibling
    }

    if (!neighbor || !desc) {
      return side < 0 ? this.posAtStart : this.posAtEnd
    }
    return side < 0 ? this.posBeforeChild(desc) + desc.size : this.posBeforeChild(desc)
  }

  private snapsToEnd(dom: DOMNode, offset: number, bias: number): boolean {
    if (dom === this.dom && this.contentDOM) {
      return offset > domIndex(this.contentDOM)
    }
    if (this.contentDOM && this.contentDOM !== this.dom && this.dom.contains(this.contentDOM)) {
      // eslint-disable-next-line no-bitwise -- compareDocumentPosition returns a bitmask
      return (dom.compareDocumentPosition(this.contentDOM) & 2) !== 0
    }

    if (this.dom.firstChild) {
      if (offset === 0) {
        for (let search: DOMNode = dom; ; search = search.parentNode!) {
          if (search === this.dom) {
            return false
          }
          if (search.previousSibling) {
            break
          }
        }
      }
      if (offset === dom.childNodes.length) {
        for (let search: DOMNode = dom; ; search = search.parentNode!) {
          if (search === this.dom) {
            return true
          }
          if (search.nextSibling) {
            break
          }
        }
      }
    }

    return bias > 0
  }

  /** Walk up `dom`'s parents until we hit a desc that belongs to this tree. */
  nearestDesc(dom: DOMNode, onlyNodes = false): ReactViewDesc | undefined {
    let first = true
    let cur: DOMNode | null = dom
    while (cur) {
      const desc = this.getDesc(cur)
      const skip = !desc || (onlyNodes && !desc.node)

      // Skip descs whose wrapper element contains `dom` but whose nodeDOM doesn't.
      if (!skip && first) {
        const nodeDOM = (desc as ReactViewDesc & { nodeDOM?: DOMNode }).nodeDOM
        const target = dom.nodeType === 1 ? dom : dom.parentNode
        if (!isInsideNodeDOM(nodeDOM, dom, target)) {
          first = false
          cur = cur.parentNode
          continue
        }
      }

      if (!skip) {
        return desc
      }
      cur = cur.parentNode
    }
    return undefined
  }

  /** Resolve a DOM node to its desc, but only if it belongs to this subtree. */
  getDesc(dom: DOMNode): ReactViewDesc | undefined {
    const desc = dom.pmViewDesc
    for (let cur: ReactViewDesc | undefined = desc; cur; cur = cur.parent) {
      if (cur === this) {
        return desc
      }
    }
    return undefined
  }

  /** DOM position → doc position. Returns `-1` if `dom` isn't in our subtree. */
  posFromDOM(dom: DOMNode, offset: number, bias: number): number {
    for (let scan: DOMNode | null = dom; scan; scan = scan.parentNode) {
      const desc = this.getDesc(scan)
      if (desc) {
        return desc.localPosFromDOM(dom, offset, bias)
      }
    }
    return -1
  }

  /** Desc immediately after `pos`, or `undefined` if pos is inside an atom. */
  descAt(pos: number): ReactViewDesc | undefined {
    let offset = 0
    for (let i = 0; i < this.children.length; i += 1) {
      let child = this.children[i]!
      const end = offset + child.size
      if (offset === pos && end !== offset) {
        // Descend through mark wrappers to the underlying node desc.
        while (!child.border && child.children.length) {
          for (let j = 0; j < child.children.length; j += 1) {
            const inner = child.children[j]!
            if (inner.size) {
              child = inner
              break
            }
          }
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

  /** Doc position → `{ node, offset }`. Inverse of `posFromDOM`. */
  domFromPos(pos: number, side: number): { node: DOMNode; offset: number; atom?: number } {
    if (!this.contentDOM) {
      return { node: this.dom, offset: 0, atom: pos + 1 }
    }

    // Find the child containing pos.
    let childIndex = 0
    let entryOffset = 0
    let curPos = 0
    for (; childIndex < this.children.length; childIndex += 1) {
      const child = this.children[childIndex]!
      const end = curPos + child.size
      if (end > pos || child.isTrailingHack) {
        entryOffset = pos - curPos
        break
      }
      curPos = end
    }

    if (entryOffset) {
      const child = this.children[childIndex]!
      return child.domFromPos(entryOffset - child.border, side)
    }

    // Skip zero-width right-binding widgets so the cursor lands before them.
    let i = childIndex
    while (i > 0) {
      const prev = this.children[i - 1]!
      const prevSide = prev.widgetSide
      if (prev.size || prevSide === null || prevSide < 0) {
        break
      }
      i -= 1
    }

    const direction: -1 | 1 = side <= 0 ? -1 : 1
    return this.domFromPosOnSide(i, side, direction)
  }

  private childAtSide(i: number, direction: -1 | 1): ReactViewDesc | null {
    if (direction < 0) {
      return i > 0 ? this.children[i - 1]! : null
    }
    return i < this.children.length ? this.children[i]! : null
  }

  private domFromPosOnSide(
    fromIndex: number,
    side: number,
    direction: -1 | 1,
  ): { node: DOMNode; offset: number; atom?: number } {
    let neighbor: ReactViewDesc | null = null
    let enter = true
    let i = fromIndex
    for (; ; enter = false) {
      neighbor = this.childAtSide(i, direction)
      if (!neighbor || neighbor.dom.parentNode === this.contentDOM) {
        break
      }
      i += direction
    }

    if (neighbor && enter && !neighbor.border && !neighbor.domAtom) {
      return neighbor.domFromPos(direction < 0 ? neighbor.size : 0, side)
    }

    if (direction < 0) {
      const offset = neighbor ? domIndex(neighbor.dom) + 1 : 0
      return { node: this.contentDOM!, offset }
    }
    const offset = neighbor ? domIndex(neighbor.dom) : this.contentDOM!.childNodes.length
    return { node: this.contentDOM!, offset }
  }

  /** Locate a DOM range that covers `[from, to]` for re-parsing. */
  parseRange(
    from: number,
    to: number,
    base = 0,
  ): { node: DOMNode; from: number; to: number; fromOffset: number; toOffset: number } {
    if (this.children.length === 0) {
      return {
        node: this.contentDOM!,
        from,
        to,
        fromOffset: 0,
        toOffset: this.contentDOM!.childNodes.length,
      }
    }

    let fromOffset = -1
    let toOffset = -1
    let fromPos = from
    let toPos = to

    let offset = base
    for (let i = 0; ; i += 1) {
      const child = this.children[i]!
      const end = offset + child.size

      // Narrow to a single child that contains the whole range, if possible.
      if (fromOffset === -1 && fromPos <= end) {
        const childBase = offset + child.border
        if (
          fromPos >= childBase &&
          toPos <= end - child.border &&
          child.node &&
          child.contentDOM &&
          this.contentDOM!.contains(child.contentDOM)
        ) {
          return child.parseRange(fromPos, toPos, childBase)
        }

        // Otherwise snap `from` outward to the previous solid sibling.
        fromPos = offset
        for (let j = i; j > 0; j -= 1) {
          const prev = this.children[j - 1]!
          if (prev.size && prev.dom.parentNode === this.contentDOM && !prev.emptyChildAt(1)) {
            fromOffset = domIndex(prev.dom) + 1
            break
          }
          fromPos -= prev.size
        }
        if (fromOffset === -1) {
          fromOffset = 0
        }
      }

      if (fromOffset > -1 && (end > toPos || i === this.children.length - 1)) {
        toPos = end
        for (let j = i + 1; j < this.children.length; j += 1) {
          const next = this.children[j]!
          if (next.size && next.dom.parentNode === this.contentDOM && !next.emptyChildAt(-1)) {
            toOffset = domIndex(next.dom)
            break
          }
          toPos += next.size
        }
        if (toOffset === -1) {
          toOffset = this.contentDOM!.childNodes.length
        }
        break
      }
      offset = end
    }

    return { node: this.contentDOM!, from: fromPos, to: toPos, fromOffset, toOffset }
  }

  /** True when the edge on `side` only contains zero-width descs. */
  emptyChildAt(side: number): boolean {
    if (this.border || !this.contentDOM || !this.children.length) {
      return false
    }
    const child = this.children[side < 0 ? 0 : this.children.length - 1]!
    return child.size === 0 || child.emptyChildAt(side)
  }

  /** DOM node directly after `pos`. */
  domAfterPos(pos: number): DOMNode {
    const { node, offset } = this.domFromPos(pos, 0)
    if (node.nodeType !== 1 || offset === node.childNodes.length) {
      throw new RangeError(`ReactViewDesc.domAfterPos: no DOM node after pos ${pos}`)
    }
    return (node as HTMLElement).childNodes[offset]!
  }

  // Write methods — no-ops because React owns the DOM.

  /** Returning `true` tells PM the desc already matches; no redraw needed. */
  update(_node: PMNode, _outerDeco: readonly Decoration[], _innerDeco: DecorationSource, _view: EditorView): boolean {
    return true
  }

  updateOuterDeco(_outerDeco: readonly Decoration[]): void {
    /* no-op */
  }

  markDirty(_from: number, _to: number): void {
    this.dirty = CONTENT_DIRTY
  }

  markParentsDirty(): void {
    for (let cur: ReactViewDesc | undefined = this.parent; cur; cur = cur.parent) {
      if (cur.dirty < CHILD_DIRTY) {
        cur.dirty = CHILD_DIRTY
      }
    }
  }

  setSelection(_anchor: number, _head: number, _view: EditorView, _force?: boolean): void {
    /* React + DOM observer handle selection */
  }

  selectNode(): void {
    /* wired up later */
  }

  deselectNode(): void {
    /* wired up later */
  }

  /** Clear back-pointers and recurse. React unmounts the DOM nodes themselves. */
  destroy(): void {
    this.parent = undefined
    if (this.dom.pmViewDesc === this) {
      this.dom.pmViewDesc = undefined
    }
    for (let i = 0; i < this.children.length; i += 1) {
      this.children[i]!.destroy()
    }
  }

  isText(_text: string): boolean {
    return false
  }
}
