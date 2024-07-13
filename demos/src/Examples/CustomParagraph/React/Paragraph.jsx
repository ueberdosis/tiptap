import { Paragraph as BaseParagraph } from '@tiptap/extension-paragraph'
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from '@tiptap/react'

const ParagraphComponent = ({ node }) => {
  return (
    <NodeViewWrapper style={{ position: 'relative' }}>
      <span contentEditable={false} className="label" style={{
        position: 'absolute', right: '100%', fontSize: '10px', color: '#999',
      }}>
        {node.textContent.length}
      </span>
      <NodeViewContent as="p" />
    </NodeViewWrapper>
  )
}

export const Paragraph = BaseParagraph.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ParagraphComponent)
  },
})
