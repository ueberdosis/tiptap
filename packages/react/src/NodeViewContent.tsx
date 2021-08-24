import React, { useEffect } from 'react'
import { useReactNodeView } from './useReactNodeView'

export interface NodeViewContentProps {
  [key: string]: any,
  as?: React.ElementType,
}

export const NodeViewContent: React.FC<NodeViewContentProps> = React.forwardRef((props, ref) => {
  const Tag = props.as || 'div'
  const { maybeMoveContentDOM } = useReactNodeView()

  useEffect(() => {
    maybeMoveContentDOM?.()
  }, [])

  return (
    <Tag
      {...props}
      ref={ref}
      data-node-view-content=""
      style={{
        ...props.style,
        whiteSpace: 'pre-wrap',
      }}
    />
  )
})
