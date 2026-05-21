/** @jsxImportSource react */

/**
 * Root of the React-rendered ProseMirror document.
 *
 * When `dom` is provided (editor-integrated mode), the desc's `dom`
 * is that external element and we render children directly into it.
 * When omitted (standalone/preview mode), we render our own wrapping
 * `<div>` and use it as the desc's dom.
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
  doc: PMNode
  /** External DOM element to use as the doc's dom (= view.dom). */
  dom?: HTMLElement
  /** Callback that fires once the root desc is built. */
  onDocDesc?: (desc: ReactNodeViewDesc | null) => void
}

export function DocNodeView(props: DocNodeViewProps) {
  const { doc, dom, onDocDesc } = props

  const domRef = useRef<HTMLElement | null>(dom ?? null)
  // When an external `dom` is provided, keep the ref synced each render.
  if (dom) {
    domRef.current = dom
  }

  // Callback ref for the standalone (own div) case: assigns into domRef
  // synchronously when the div mounts, so the first layout effect sees it.
  const setOwnRef = (el: HTMLDivElement | null) => {
    if (!dom) {
      domRef.current = el
    }
  }

  const { childContext, descRef } = useNodeViewDescription({
    node: doc,
    outerDeco: [],
    innerDeco: DecorationSet.empty,
    domRef,
    contentDOMRef: domRef,
    index: 0,
  })

  useEffect(() => {
    onDocDesc?.(descRef.current)
  })

  const children: ReactNode[] = []
  doc.forEach((child, _, i) => {
    children.push(<NodeView key={i} node={child} index={i} />)
  })

  return (
    <ChildDescriptionsContext.Provider value={childContext}>
      {dom ? children : <div ref={setOwnRef}>{children}</div>}
    </ChildDescriptionsContext.Provider>
  )
}
