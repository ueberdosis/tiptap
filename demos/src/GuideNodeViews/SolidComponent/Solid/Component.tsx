import type { NodeViewProps } from '@tiptap/core'
import { NodeViewWrapper } from '@tiptap/solid'
import { createEffect, createSignal } from 'solid-js'

export default function Component(props: NodeViewProps) {
  const [count, setCount] = createSignal(Number(props.node.attrs.count ?? 0))

  createEffect(() => {
    setCount(Number(props.node.attrs.count ?? 0))
  })

  const increase = () => {
    const next = count() + 1
    setCount(next)
    props.updateAttributes({ count: next })
  }

  return (
    <NodeViewWrapper class="solid-component">
      <label contenteditable={false}>Solid Component</label>

      <div class="content" contenteditable={false}>
        <button type="button" onClick={increase}>
          This button has been clicked {count()} times.
        </button>
      </div>
    </NodeViewWrapper>
  )
}
