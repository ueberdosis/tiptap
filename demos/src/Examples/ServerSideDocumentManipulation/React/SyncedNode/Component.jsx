import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React from 'react'

export default ({ node }) => {
  return (
    <NodeViewWrapper className="synced-node">
      <div className="synced-node-content">
        <label contentEditable={false}>Synced Node (ID: {node.attrs.id})</label>
        {node.attrs.imageSrc && <img src={node.attrs.imageSrc} alt="" contentEditable={false} />}

        <NodeViewContent />
      </div>
      <div class="hint"><b>Note:</b> Changes in this node sync to other documents.</div>
    </NodeViewWrapper>
  )
}
