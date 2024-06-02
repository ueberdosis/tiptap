import React from 'react'

import { useReactNodeView } from './useReactNodeView.js'

export interface NodeViewWrapperProps {
  [key: string]: any,
  as?: React.ElementType,
}

// TODO not sure that we need all of this, I feel like it could just be a hook that spreads props onto a user's top-level component
export const NodeViewWrapper: React.FC<NodeViewWrapperProps> = React.forwardRef((props, ref) => {
  const { onDragStart } = useReactNodeView()
  const Tag = props.as || 'div'

  return (
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
