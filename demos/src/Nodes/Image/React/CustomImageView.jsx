import { NodeViewContent,NodeViewWrapper } from '@tiptap/react'
import React from 'react'

export const CustomImageView = ({ node }) => {
  const { showCaption } = node.attrs
  return (
    <NodeViewWrapper as="figure">
      <img src={node.attrs.src} alt={node.attrs.alt} />
      {showCaption && <NodeViewContent as="figcaption" />}
    </NodeViewWrapper>
  )
}
