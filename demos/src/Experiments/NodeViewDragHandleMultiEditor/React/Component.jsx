import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React from 'react'

export default () => {
  return (
    <NodeViewWrapper className="draggable-item">
      <div className="drag-handle" contentEditable={false} draggable="true" data-drag-handle />
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  )
}
