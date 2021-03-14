import React from 'react'
import { useReactNodeView } from './useReactNodeView'

export const NodeViewWrapper: React.FC = props => {
  // TODO
  // @ts-ignore
  const { onDragStart } = useReactNodeView()

  return (
    <div
      data-node-view-wrapper=""
      style={{
        whiteSpace: 'normal'
      }}
      onDragStart={onDragStart}
    >
     {props.children}
    </div>
  )

}
