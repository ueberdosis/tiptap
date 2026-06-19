import { NodeViewContent, NodeViewWrapper } from '@tiptap/solid'

export default function Component() {
  return (
    <NodeViewWrapper class="draggable-item">
      <div class="drag-handle" contenteditable={false} draggable={true} data-drag-handle="" />
      <NodeViewContent class="content" />
    </NodeViewWrapper>
  )
}
