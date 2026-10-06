import type { ReactNodeViewProps } from '@tiptap/react'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React, { useRef } from 'react'

export default (props: ReactNodeViewProps) => {
  const renderCount = useRef(0)
  renderCount.current += 1

  const toggleHighlight = () => {
    props.updateAttributes({
      highlight: !props.node.attrs.highlight,
    })
  }

  const showPosition = () => {
    alert(`Current position: ${props.getPos()}`)
  }

  return (
    <NodeViewWrapper className="react-component">
      <label contentEditable={false}>React Decorations (rendered: {renderCount.current}x)</label>

      <NodeViewContent className="content is-editable" />

      <div className="toolbar" contentEditable={false}>
        <button onClick={toggleHighlight}>
          {props.node.attrs.highlight ? 'Remove Decorations' : 'Add Decorations'}
        </button>
        <button onClick={showPosition}>Show Position</button>
      </div>
    </NodeViewWrapper>
  )
}
