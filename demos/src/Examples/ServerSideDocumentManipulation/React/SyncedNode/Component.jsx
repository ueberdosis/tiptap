import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React from 'react'

export default ({ node }) => {
  return (
    <NodeViewWrapper className="synced-node">
      <label contentEditable={false}>Synced Node (ID: {node.attrs.id})</label>
      {node.attrs.imageSrc && <img src={node.attrs.imageSrc} alt="" contentEditable={false} />}

      <NodeViewContent className="content is-editable" />
    </NodeViewWrapper>
  )
}
