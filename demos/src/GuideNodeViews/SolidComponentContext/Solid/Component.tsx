import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/solid'
import { useContext } from 'solid-js'

import { Context } from './context.js'

export default function Component(props: NodeViewProps) {
  const context = useContext(Context)

  const increase = () => {
    props.updateAttributes({
      count: props.node.attrs.count + 1,
    })
  }

  return (
    <NodeViewWrapper class="solid-component">
      <label>Solid Component: {context.value}</label>

      <div class="content">
        <button onClick={increase}>
          This button has been clicked {props.node.attrs.count} times.
        </button>
      </div>
    </NodeViewWrapper>
  )
}
