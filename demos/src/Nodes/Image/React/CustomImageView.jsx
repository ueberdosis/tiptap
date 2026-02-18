import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React from 'react'

export const CustomImageView = ({ node, editor }) => {
  const { showCaption } = node.attrs
  const shouldShowCaption = showCaption || node.content.size > 0
  const isEditable = editor?.isEditable ?? true
  return (
    <NodeViewWrapper as="figure">
      <img src={node.attrs.src} alt={node.attrs.alt} />
      {isEditable && shouldShowCaption && <NodeViewContent as="figcaption" />}
    </NodeViewWrapper>
  )
}
