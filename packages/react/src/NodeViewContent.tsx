import React from 'react'

export interface NodeViewContentProps {
  className?: string,
  as: React.ElementType,
}

export const NodeViewContent: React.FC<NodeViewContentProps> = props => {
  const Tag = props.as || 'div'

  return (
    <Tag
      className={props.className}
      data-node-view-content=""
      style={{ whiteSpace: 'pre-wrap' }}
    />
  )
}
