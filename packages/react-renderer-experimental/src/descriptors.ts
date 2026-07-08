import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource } from '@tiptap/pm/view'
import { DecorationSet } from '@tiptap/pm/view'

import type { ViewDesc } from './viewdesc.js'
import { MarkViewDesc, NodeViewDesc, NOT_DIRTY, TextViewDesc, WidgetViewDesc } from './viewdesc.js'

const NO_DECORATIONS: readonly never[] = []

export interface NodeDescOptions {
  /** An existing desc to refresh in place, so identity survives re-renders. */
  desc: NodeViewDesc | undefined
  node: ProseMirrorNode
  dom: Node
  contentDOM: HTMLElement | null
  nodeDOM: Node
  outerDeco?: readonly Decoration[]
  innerDeco?: DecorationSource
}

/**
 * Creates or refreshes the desc for a React-rendered node. Descs are mutated
 * in place across commits: the desc object (and usually its DOM) is stable
 * per component instance, only the document node it describes changes.
 */
export const updateNodeViewDesc = ({
  desc,
  node,
  dom,
  contentDOM,
  nodeDOM,
  outerDeco = NO_DECORATIONS,
  innerDeco = DecorationSet.empty,
}: NodeDescOptions): NodeViewDesc => {
  if (!desc) {
    return new NodeViewDesc(undefined, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM)
  }

  if (desc.dom !== dom && desc.dom.pmViewDesc === desc) {
    desc.dom.pmViewDesc = undefined
  }
  desc.node = node
  desc.outerDeco = outerDeco
  desc.innerDeco = innerDeco
  desc.dom = dom
  desc.contentDOM = contentDOM
  desc.nodeDOM = nodeDOM
  // React just rendered DOM matching `node`, so the desc is clean again
  desc.dirty = NOT_DIRTY
  // Re-assert the expando: StrictMode unmount/remount cycles clear it
  dom.pmViewDesc = desc
  return desc
}

/** Clears the desc's DOM registration when its component unmounts. */
export const detachNodeViewDesc = (desc: NodeViewDesc): void => {
  if (desc.dom.pmViewDesc === desc) {
    desc.dom.pmViewDesc = undefined
  }
  desc.parent = undefined
}

/**
 * Rebuilds `desc.children` by walking the rendered `contentDOM`.
 *
 * React layout effects run children before parents, so by the time a node's
 * effect calls this, every rendered child element already carries its own
 * refreshed desc on the `pmViewDesc` expando — walking the DOM yields them
 * in document order. Text runs have no component (React cannot ref a DOM
 * text node), so undecorated ones are bound here by pairing DOM text nodes
 * with (slices of) the node's inline children; decorated runs register their
 * own `TextViewDesc` from `DecoratedText`. The walk descends into mark
 * elements, where the same flat child sequence continues (the cursor is
 * shared), and claims widget and trailing-hack descs without advancing.
 */
export const rebuildChildDescs = (desc: NodeViewDesc): void => {
  desc.children.length = 0
  if (desc.contentDOM) {
    walkContent(desc, desc.contentDOM, desc.node, { index: 0, textOffset: 0 })
  }
}

interface WalkCursor {
  /** Index of the current child within the parent node. */
  index: number
  /** Consumed characters within the current (text) child — slices. */
  textOffset: number
}

const advanceText = (cursor: WalkCursor, pmChild: ProseMirrorNode, length: number): void => {
  cursor.textOffset += length
  if (cursor.textOffset >= (pmChild.text?.length ?? 0)) {
    cursor.index += 1
    cursor.textOffset = 0
  }
}

const walkContent = (
  parent: ViewDesc,
  container: HTMLElement,
  node: ProseMirrorNode,
  cursor: WalkCursor,
): void => {
  container.childNodes.forEach(domChild => {
    if (domChild.nodeType === Node.TEXT_NODE) {
      claimTextNode(parent, domChild, node, cursor)
    } else {
      claimElement(parent, domChild, node, cursor)
    }
  })
}

const claimTextNode = (
  parent: ViewDesc,
  domChild: Node,
  node: ProseMirrorNode,
  cursor: WalkCursor,
): void => {
  const pmChild = node.maybeChild(cursor.index)

  // A DOM text node with no matching document text describes nothing
  if (!pmChild?.isText) {
    return
  }

  const text = pmChild.text ?? ''
  const length = domChild.nodeValue?.length ?? 0
  // Inline decorations split text runs; the DOM text then corresponds to a
  // slice of the document text node
  const slice =
    cursor.textOffset === 0 && length === text.length
      ? pmChild
      : pmChild.cut(cursor.textOffset, Math.min(cursor.textOffset + length, text.length))

  parent.children.push(bindTextDesc(parent, slice, domChild))
  advanceText(cursor, pmChild, length)
}

const claim = (parent: ViewDesc, childDesc: ViewDesc): void => {
  childDesc.parent = parent
  parent.children.push(childDesc)
}

const claimMark = (
  parent: ViewDesc,
  markDesc: MarkViewDesc,
  node: ProseMirrorNode,
  cursor: WalkCursor,
): void => {
  markDesc.children.length = 0
  claim(parent, markDesc)
  if (markDesc.contentDOM) {
    // The flat inline child sequence continues inside the mark element
    walkContent(markDesc, markDesc.contentDOM, node, cursor)
  }
}

/** A decoration-wrapped text run; its desc was registered by DecoratedText. */
const claimDecoratedText = (
  parent: ViewDesc,
  textDesc: TextViewDesc,
  node: ProseMirrorNode,
  cursor: WalkCursor,
): void => {
  const pmChild = node.maybeChild(cursor.index)

  if (!pmChild?.isText) {
    return
  }
  claim(parent, textDesc)
  advanceText(cursor, pmChild, textDesc.node.text?.length ?? 0)
}

const claimElement = (
  parent: ViewDesc,
  domChild: Node,
  node: ProseMirrorNode,
  cursor: WalkCursor,
): void => {
  const childDesc = domChild.pmViewDesc

  if (!childDesc || childDesc === parent) {
    return
  }
  if (childDesc instanceof MarkViewDesc) {
    claimMark(parent, childDesc, node, cursor)
  } else if (childDesc instanceof TextViewDesc) {
    claimDecoratedText(parent, childDesc, node, cursor)
  } else if (childDesc instanceof WidgetViewDesc || childDesc.isTrailingHack) {
    // Zero-size descs: claimed in order, the content cursor stays put
    claim(parent, childDesc)
  } else if (childDesc.node) {
    claim(parent, childDesc)
    cursor.index += 1
    cursor.textOffset = 0
  }
}

const bindTextDesc = (parent: ViewDesc, pmChild: ProseMirrorNode, domChild: Node): TextViewDesc => {
  const existing = domChild.pmViewDesc

  if (existing instanceof TextViewDesc && existing.nodeDOM === domChild) {
    existing.node = pmChild
    existing.parent = parent
    existing.dirty = NOT_DIRTY
    return existing
  }
  return new TextViewDesc(parent, pmChild, NO_DECORATIONS, DecorationSet.empty, domChild, domChild)
}
