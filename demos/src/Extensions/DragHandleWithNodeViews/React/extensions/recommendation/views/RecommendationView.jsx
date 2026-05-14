import { NodeViewWrapper } from '@tiptap/react'

export const RecommendationView = ({ node, position }) => {
  return (
    <NodeViewWrapper data-drag-handle>
      <div className="title">Recommendation {node.attrs.id}</div>
      <p>Test</p>
      <small style={{ opacity: 0.5 }}>pos: {position}</small>
    </NodeViewWrapper>
  )
}
