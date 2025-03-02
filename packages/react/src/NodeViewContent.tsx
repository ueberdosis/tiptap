import React from 'react'

import { useReactNodeView } from './useReactNodeView.js'

export interface NodeViewContentProps {
  [key: string]: any,
  as?: React.ElementType,
}

export const NodeViewContent: React.FC<NodeViewContentProps> = props => {
  const Tag = props.as || 'div'
  const { nodeViewContentRef } = useReactNodeView()

  return (
    // @ts-ignore
    <Tag
      {...props}
      ref={(el: HTMLElement) => {
        nodeViewContentRef?.(el)
        // props.ref is not accessible in React: https://reactjs.org/link/special-props
        props.getRef?.(el)
      }}
      data-node-view-content=""
      style={{
        whiteSpace: 'pre-wrap',
        ...props.style,
      }}
    />
  )
}
