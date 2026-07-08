import type { NodeViewComponentProps } from '@tiptap/react-renderer-experimental'
import React, { useContext } from 'react'

import { Context } from './Context.js'

/**
 * With the experimental renderer there is no portal between the provider
 * and the node view: `useContext` reads the surrounding provider directly,
 * like in any other React tree.
 */
export default (props: NodeViewComponentProps<HTMLDivElement>) => {
  const { value } = useContext(Context)

  const increase = () => {
    props.updateAttributes({
      count: (props.node.attrs.count as number) + 1,
    })
  }

  return (
    <div className="react-component" ref={props.ref} contentEditable={false}>
      <label>React Component: {value}</label>

      <div className="content">
        <button onClick={increase}>
          This button has been clicked {props.node.attrs.count} times.
        </button>
      </div>
    </div>
  )
}
