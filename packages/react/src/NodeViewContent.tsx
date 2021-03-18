import React from 'react'
import { useReactNodeView } from './useReactNodeView'

export interface NodeViewContentProps {
  className?: string,
  as: React.ElementType,
}

export const NodeViewContent: React.FC<NodeViewContentProps> = props => {
  const { isEditable } = useReactNodeView()
  const Tag = props.as || 'div'

  return (
    <Tag
      className={props.className}
      data-node-view-content=""
      contentEditable={isEditable}
      style={{ whiteSpace: 'pre-wrap' }}
    />
  )
}
