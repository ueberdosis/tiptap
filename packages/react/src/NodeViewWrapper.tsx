import React from 'react'
import { useReactNodeView } from './useReactNodeView'

export interface NodeViewWrapperProps {
  className?: string,
  as?: React.ElementType,
}

export const NodeViewWrapper: React.FC<NodeViewWrapperProps> = props => {
  const { onDragStart } = useReactNodeView()
  const Tag = props.as || 'div'

  return (
    <Tag
      className={props.className}
      data-node-view-wrapper=""
      onDragStart={onDragStart}
      style={{ whiteSpace: 'normal' }}
    >
     {props.children}
    </Tag>
  )
}
