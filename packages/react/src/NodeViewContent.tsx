import React from 'react'
import { useReactNodeView } from './useReactNodeView'

export const NodeViewContent: React.FC = props => {
  // TODO
  // @ts-ignore
  const { isEditable } = useReactNodeView()

  return (
    <div
      data-node-view-content=""
      contentEditable={isEditable}
      style={{
        whiteSpace: 'pre-wrap'
      }}
    />
  )

}
