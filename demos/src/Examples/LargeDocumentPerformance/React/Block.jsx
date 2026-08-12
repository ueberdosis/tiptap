import { NodeViewContent, NodeViewWrapper, useEditorState } from '@tiptap/react'
import React from 'react'

import { selectorMode } from './selectorMode.js'

/**
 * Used for both node types in this demo. Every instance subscribes to the
 * editor with `useEditorState`, like most real node views do, so the selector
 * runs in every instance on every transaction.
 */
export default props => {
  const isCollapsed = useEditorState({
    editor: props.editor,
    selector: ({ editor }) => {
      window.__selectorCalls = (window.__selectorCalls ?? 0) + 1

      if (!selectorMode.dependsOnSelection) {
        return true
      }

      return editor.state.selection.empty
    },
  })

  return (
    <NodeViewWrapper className={`perf-${props.node.type.name}`} data-collapsed={isCollapsed}>
      <NodeViewContent />
    </NodeViewWrapper>
  )
}
