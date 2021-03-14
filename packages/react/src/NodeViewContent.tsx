import React from 'react'
import { useReactNodeView } from './useReactNodeView'

export interface NodeViewContentProps {
  as: React.ElementType
}

export const NodeViewContent: React.FC<NodeViewContentProps> = props => {
  // TODO
  // @ts-ignore
  const { isEditable } = useReactNodeView()

  const Tag = props.as || 'div'

  return (
    <Tag
      data-node-view-content=""
      contentEditable={isEditable}
      style={{
        whiteSpace: 'pre-wrap'
      }}
    />
  )
}
