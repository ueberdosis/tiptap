import React from 'react'

export const NodeViewWrapper: React.FC = props => {

  // TODO
  const onDragStart = () => {
    console.log('drag start')
  }

  return (
    <div
      data-node-view-wrapper=""
      // contentEditable={false}
      style={{
        whiteSpace: 'normal'
      }}
      onDragStart={onDragStart}
    >
     {props.children}
    </div>
  )

}
