import React from 'react'

import { useReactNodeView } from './useReactNodeView'

export interface NodeViewContentProps {
  [key: string]: any,
  as?: React.ElementType,
}

export const NodeViewContent: React.FC<NodeViewContentProps> = props => {
  const Tag = props.as || 'div'
  const { nodeViewContentRef } = useReactNodeView()

  return (
    <Tag
      {...props}
      ref={nodeViewContentRef}
      data-node-view-content=""
      style={{
        whiteSpace: 'pre-wrap',
        ...props.style,
      }}
    />
  )
}
