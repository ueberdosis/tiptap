import React from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'

export default () => {
  return (
    <NodeViewWrapper className="react-component">
      <span className="label">React Component</span>

      <NodeViewContent className="content" />
    </NodeViewWrapper>
  )
}
