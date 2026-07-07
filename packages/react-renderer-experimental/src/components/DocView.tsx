/** @jsxImportSource react */
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { HTMLAttributes, ReactNode } from 'react'
import { useRef } from 'react'

import { useNodeViewDesc } from '../hooks/useNodeViewDesc.js'
import type { NodeViewDesc } from '../viewdesc.js'
import { ChildNodeViews } from './NodeView.js'

export interface DocViewProps extends HTMLAttributes<HTMLDivElement> {
  /** The document node to render. */
  node: ProseMirrorNode
  /** Called after each commit with the refreshed root desc. */
  onDocDesc?: (desc: NodeViewDesc) => void
}

/**
 * Renders the document into a plain element that doubles as the editable
 * mount (`view.dom`). Its layout effect runs after all descendant node
 * effects, so it assembles the completed `ViewDesc` tree for the commit.
 */
export function DocView({ node, onDocDesc, ...props }: DocViewProps): ReactNode {
  const domRef = useRef<HTMLDivElement | null>(null)

  useNodeViewDesc({
    node,
    domRef,
    getContentDOM: dom => dom as HTMLElement,
    onUpdated: onDocDesc,
  })

  return (
    <div {...props} ref={domRef}>
      <ChildNodeViews node={node} innerPos={0} />
    </div>
  )
}
