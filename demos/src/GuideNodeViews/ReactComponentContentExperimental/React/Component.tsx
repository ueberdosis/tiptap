import type { NodeViewComponentProps } from '@tiptap/react-experimental'
import React from 'react'

/**
 * A content-bearing node view without NodeViewWrapper or NodeViewContent:
 * the component renders its own elements, attaches `ref` to the top-level
 * one and `contentDOMRef` to the element holding `children` (the editable
 * content ProseMirror manages).
 */
export default ({ children, ref, contentDOMRef }: NodeViewComponentProps<HTMLDivElement>) => {
  return (
    <div className="react-component" ref={ref}>
      <label contentEditable={false}>React Component</label>

      <div className="content is-editable" ref={contentDOMRef}>
        {children}
      </div>
    </div>
  )
}
