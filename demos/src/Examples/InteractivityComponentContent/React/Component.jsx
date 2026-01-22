import { NodeViewContent, NodeViewWrapper } from '@dibdab/react'
import React from 'react'

export default () => {
  return (
    <NodeViewWrapper className="react-component">
      <label contentEditable={false}>React Component</label>

      <NodeViewContent className="content is-editable" />
    </NodeViewWrapper>
  )
}
