import React from 'react'

export interface NodeViewContentProps {
  [key: string]: any,
  as?: React.ElementType,
}

export const NodeViewContent: React.FC<NodeViewContentProps> = React.forwardRef((props, ref) => {
  const Tag = props.as || 'div'

  return (
    <Tag
      {...props}
      ref={ref}
      style={{
        ...props.style,
        whiteSpace: 'pre-wrap',
      }}
    />
  )
})
