import React from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'

export default () => {
  return (
    <NodeViewWrapper className="react-component-with-content">
      <span className="label" contenteditable="false">React Component</span>

      <NodeViewContent className="content" />
    </NodeViewWrapper>
  )
}
