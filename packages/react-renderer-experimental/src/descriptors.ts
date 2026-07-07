import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { DecorationSet } from '@tiptap/pm/view'

import { NodeViewDesc, NOT_DIRTY, TextViewDesc } from './viewdesc.js'

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
 * refreshed desc on the `pmViewDesc` expando — walking the DOM yields them in
 * document order. Text runs have no component (React cannot ref a DOM text
 * node), so they are bound here by pairing DOM text nodes with the node's
 * text children.
 */
export const rebuildChildDescs = (desc: NodeViewDesc): void => {
  const { contentDOM, node } = desc

  desc.children.length = 0
  if (!contentDOM) {
    return
  }

  let childIndex = 0

  contentDOM.childNodes.forEach(domChild => {
    if (domChild.nodeType === Node.TEXT_NODE) {
      const pmChild = node.maybeChild(childIndex)

      if (!pmChild?.isText) {
        // A DOM text node with no matching document text (e.g. rendered by a
        // future decoration) — nothing to describe
        return
      }

      const existing = domChild.pmViewDesc
      let textDesc: TextViewDesc

      if (existing instanceof TextViewDesc && existing.nodeDOM === domChild) {
        existing.node = pmChild
        existing.parent = desc
        existing.dirty = NOT_DIRTY
        textDesc = existing
      } else {
        textDesc = new TextViewDesc(
          desc,
          pmChild,
          NO_DECORATIONS,
          DecorationSet.empty,
          domChild,
          domChild,
        )
      }
      desc.children.push(textDesc)
      childIndex += 1
      return
    }

    const childDesc = domChild.pmViewDesc

    if (childDesc && childDesc !== desc && childDesc.node) {
      childDesc.parent = desc
      desc.children.push(childDesc)
      childIndex += 1
    }
  })
}
