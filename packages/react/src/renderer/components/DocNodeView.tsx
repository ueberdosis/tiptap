/** @jsxImportSource react */

/**
 * Root of the React-rendered ProseMirror document.
 *
 * Owns the top-level descriptor registry and renders the doc node
 * itself as a `<div>`. Each PM child node is rendered by `<NodeView>`.
 */

import type { Node as PMNode } from '@tiptap/pm/model'
import { DecorationSet } from '@tiptap/pm/view'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'

import { ChildDescriptionsContext } from '../contexts/ChildDescriptionsContext.js'
import { useNodeViewDescription } from '../hooks/useNodeViewDescription.js'
import type { ReactNodeViewDesc } from '../viewdesc/index.js'
import { NodeView } from './NodeView.js'

export interface DocNodeViewProps {
  /** The PM doc node to render. */
  doc: PMNode
  /** Optional callback that fires once the root desc is built. */
  onDocDesc?: (desc: ReactNodeViewDesc | null) => void
}

export function DocNodeView(props: DocNodeViewProps) {
  const { doc, onDocDesc } = props
  const domRef = useRef<HTMLDivElement>(null)

  const { childContext, descRef } = useNodeViewDescription({
    node: doc,
    outerDeco: [],
    innerDeco: DecorationSet.empty,
    domRef,
    contentDOMRef: domRef,
    index: 0,
  })

  // Expose the root desc after each commit. Real wiring goes through
  // `view.docView` later; this is for tests + early demos.
  useEffect(() => {
    onDocDesc?.(descRef.current)
  })

  const children: ReactNode[] = []
  doc.forEach((child, _, i) => {
    children.push(<NodeView key={i} node={child} index={i} />)
  })

  return (
    <ChildDescriptionsContext.Provider value={childContext}>
      <div ref={domRef}>{children}</div>
    </ChildDescriptionsContext.Provider>
  )
}
