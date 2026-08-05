import React from 'react'

import { useReactNodeView } from './useReactNodeView.js'

/**
 * Props for `NodeViewWrapper`.
 */
export interface NodeViewWrapperProps {
  [key: string]: any
  as?: React.ElementType
}

/**
 * The outer element of a node view. Every React node view needs one.
 */
export const NodeViewWrapper: React.FC<NodeViewWrapperProps> = React.forwardRef((props, ref) => {
  const { onDragStart } = useReactNodeView()
  const Tag = props.as || 'div'

  return (
    // @ts-ignore
    <Tag
      {...props}
      ref={ref}
      data-node-view-wrapper=""
      onDragStart={onDragStart}
      style={{
        whiteSpace: 'normal',
        ...props.style,
      }}
    />
  )
})
