import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { DecorationSet } from '@tiptap/pm/view'

import type { ViewDesc } from './viewdesc.js'
import { MarkViewDesc, NodeViewDesc, NOT_DIRTY, TextViewDesc } from './viewdesc.js'

const NO_DECORATIONS: readonly never[] = []

export interface NodeDescOptions {
  /** An existing desc to refresh in place, so identity survives re-renders. */
  desc: NodeViewDesc | undefined
  node: ProseMirrorNode
  dom: Node
  contentDOM: HTMLElement | null
  nodeDOM: Node
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
}: NodeDescOptions): NodeViewDesc => {
  if (!desc) {
    return new NodeViewDesc(
      undefined,
      node,
      NO_DECORATIONS,
      DecorationSet.empty,
      dom,
      contentDOM,
      nodeDOM,
    )
  }

  if (desc.dom !== dom && desc.dom.pmViewDesc === desc) {
    desc.dom.pmViewDesc = undefined
  }
  desc.node = node
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
 * text node), so they are bound here by pairing DOM text nodes with the
 * node's inline children; the walk descends into mark elements, where the
 * same flat child sequence continues (the cursor is shared).
 */
export const rebuildChildDescs = (desc: NodeViewDesc): void => {
  desc.children.length = 0
  if (desc.contentDOM) {
    walkContent(desc, desc.contentDOM, desc.node, { index: 0 })
  }
}

interface WalkCursor {
  index: number
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

  // A DOM text node with no matching document text (e.g. rendered by a
  // future decoration) describes nothing
  if (pmChild?.isText) {
    parent.children.push(bindTextDesc(parent, pmChild, domChild))
    cursor.index += 1
  }
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
    childDesc.parent = parent
    childDesc.children.length = 0
    parent.children.push(childDesc)
    if (childDesc.contentDOM) {
      // The flat inline child sequence continues inside the mark element
      walkContent(childDesc, childDesc.contentDOM, node, cursor)
    }
    return
  }
  if (childDesc.node || childDesc.isTrailingHack) {
    childDesc.parent = parent
    parent.children.push(childDesc)
    if (childDesc.node) {
      cursor.index += 1
    }
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
