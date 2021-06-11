import React from 'react'
import { useReactNodeView } from './useReactNodeView'

export interface NodeViewWrapperProps {
  [key: string]: any,
  as?: React.ElementType,
}

export const NodeViewWrapper: React.FC<NodeViewWrapperProps> =
  React.forwardRef((props, ref) => {
    const { onDragStart } = useReactNodeView()
    const Tag = props.as || 'div'

    return (
      <Tag
        {...props}
        ref={ref}
        data-node-view-wrapper=""
        onDragStart={onDragStart}
        style={{
          ...props.style,
          whiteSpace: 'normal',
        }}
      />
    )
  }
}
