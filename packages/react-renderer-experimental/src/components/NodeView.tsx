/** @jsxImportSource react */
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { ReactNode } from 'react'
import { Fragment, useRef } from 'react'

import { useNodeViewDesc } from '../hooks/useNodeViewDesc.js'
import { renderOutputSpec } from './OutputSpecView.js'

export interface NodeViewProps {
  node: ProseMirrorNode
}

export interface ChildNodeViewsProps {
  node: ProseMirrorNode
}

/*
 * NodeView and ChildNodeViews are mutually recursive (a node renders its
 * children, which render nodes), so they live in one module.
 */

/**
 * Renders a document node from its schema `toDOM` spec — the schema-rendered
 * case, producing exactly the elements the spec describes (no wrapper DOM).
 * A layout effect keeps the node's `ViewDesc` registered against the
 * rendered elements.
 */
export function NodeView({ node }: NodeViewProps): ReactNode {
  const domRef = useRef<Element | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)

  useNodeViewDesc({
    node,
    domRef,
    getContentDOM: () => (node.isLeaf ? null : contentRef.current),
  })

  const spec = node.type.spec.toDOM?.(node)

  if (!spec) {
    throw new RangeError(
      `[tiptap error]: Node type "${node.type.name}" has no toDOM spec and no React node view`,
    )
  }

  return renderOutputSpec(spec, {
    ref: domRef,
    contentRef,
    children: node.isLeaf ? undefined : <ChildNodeViews node={node} />,
  })
}

/**
 * Renders a node's children. Text children render as bare strings (React
 * creates real DOM text nodes for them — their descs are bound by the parent
 * node's layout effect); everything else renders through `NodeView`.
 *
 * Keys are positional for now; the `reactKeys` plugin replaces them with
 * stable per-node keys in the next phase.
 */
export function ChildNodeViews({ node }: ChildNodeViewsProps): ReactNode {
  const children: ReactNode[] = []

  node.forEach((child, _offset, index) => {
    if (child.isText) {
      children.push(<Fragment key={index}>{child.text}</Fragment>)
    } else {
      children.push(<NodeView key={index} node={child} />)
    }
  })

  return <>{children}</>
}
