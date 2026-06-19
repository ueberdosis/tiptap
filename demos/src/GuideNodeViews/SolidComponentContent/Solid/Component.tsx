import { NodeViewContent, NodeViewWrapper } from '@tiptap/solid'

export default function Component() {
  return (
    <NodeViewWrapper class="solid-component">
      <label contenteditable={false}>Solid Component</label>

      <NodeViewContent class="content is-editable" />
    </NodeViewWrapper>
  )
}
