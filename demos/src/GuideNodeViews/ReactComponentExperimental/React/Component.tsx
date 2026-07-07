import type { NodeViewComponentProps } from '@tiptap/react-renderer-experimental'
import React from 'react'

/**
 * A plain component, no NodeViewWrapper and no portal: it renders its own
 * top-level element and attaches the node view `ref` to it.
 */
export default (props: NodeViewComponentProps<HTMLDivElement>) => {
  const increase = () => {
    props.updateAttributes({
      count: (props.node.attrs.count as number) + 1,
    })
  }

  return (
    <div className="react-component" ref={props.ref} contentEditable={false}>
      <label>React Component</label>

      <div className="content">
        <button onClick={increase}>
          This button has been clicked {props.node.attrs.count} times.
        </button>
      </div>
    </div>
  )
}
