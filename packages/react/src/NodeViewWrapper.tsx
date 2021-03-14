import React from 'react'
import { useReactNodeView } from './useReactNodeView'

export interface NodeViewWrapperProps {
  as: React.ElementType
}

export const NodeViewWrapper: React.FC<NodeViewWrapperProps> = props => {
  // TODO
  // @ts-ignore
  const { onDragStart } = useReactNodeView()

  const Tag = props.as || 'div'

  return (
    <Tag
      data-node-view-wrapper=""
      style={{
        whiteSpace: 'normal'
      }}
      onDragStart={onDragStart}
    >
     {props.children}
    </Tag>
  )
}
