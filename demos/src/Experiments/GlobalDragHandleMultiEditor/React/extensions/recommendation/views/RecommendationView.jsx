import { NodeViewWrapper } from '@tiptap/react'

export const RecommendationView = ({ node }) => {
  return (
    <NodeViewWrapper data-drag-handle>
      <div className="title">Recommendation {node.attrs.id}</div>
      <p>Test</p>
    </NodeViewWrapper>
  )
}
