import React from 'react'
import { useReactNodeView } from './useReactNodeView'

export interface NodeViewWrapperProps {
  as: React.ElementType
}

export const NodeViewWrapper: React.FC<NodeViewWrapperProps> = props => {
  const { onDragStart } = useReactNodeView()
  const Tag = props.as || 'div'

  return (
    <Tag
      data-node-view-wrapper=""
      onDragStart={onDragStart}
      style={{ whiteSpace: 'normal' }}
    >
     {props.children}
    </Tag>
  )
}
