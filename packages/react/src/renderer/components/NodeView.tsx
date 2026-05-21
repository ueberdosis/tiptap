/** @jsxImportSource react */

/**
 * Renders one ProseMirror node + its children, recursively.
 *
 * For now we only support a hard-coded tag mapping (paragraph → `<p>`,
 * everything else → `<div>`). Real Tiptap uses the node's `toDOM`
 * spec; we'll switch to that in a later step.
 */

import type { Node as PMNode } from '@tiptap/pm/model'
import { DecorationSet } from '@tiptap/pm/view'
import type { ReactNode, Ref } from 'react'
import { useRef } from 'react'

import { ChildDescriptionsContext } from '../contexts/ChildDescriptionsContext.js'
import { useNodeViewDescription } from '../hooks/useNodeViewDescription.js'
import { TextNodeView } from './TextNodeView.js'

export function NodeView(props: { node: PMNode; index: number }) {
  const { node, index } = props
  const domRef = useRef<HTMLElement>(null)

  const { childContext } = useNodeViewDescription({
    node,
    outerDeco: [],
    innerDeco: DecorationSet.empty,
    domRef,
    contentDOMRef: domRef,
    index,
  })

  const children: ReactNode[] = []
  node.forEach((child, _, i) => {
    if (child.isText) {
      children.push(<TextNodeView key={i} node={child} index={i} />)
    } else {
      children.push(<NodeView key={i} node={child} index={i} />)
    }
  })

  const isParagraph = node.type.name === 'paragraph'

  return (
    <ChildDescriptionsContext.Provider value={childContext}>
      {isParagraph ? (
        <p ref={domRef as Ref<HTMLParagraphElement>}>{children}</p>
      ) : (
        <div ref={domRef as Ref<HTMLDivElement>}>{children}</div>
      )}
    </ChildDescriptionsContext.Provider>
  )
}
