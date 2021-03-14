import React from 'react'

export const NodeViewContent: React.FC = props => {

  // TODO
  const isEditable = true

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
