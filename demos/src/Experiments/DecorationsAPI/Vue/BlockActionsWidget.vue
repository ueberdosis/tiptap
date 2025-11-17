<template>
  <div
    class="block-actions-widget"
    :style="{
      display: 'inline-flex',
      gap: '4px',
      marginLeft: '8px',
      verticalAlign: 'middle',
      opacity: hover ? '1' : '0.6',
      pointerEvents: 'auto',
    }"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <button
      :style="{
        padding: '4px 8px',
        fontSize: '12px',
        backgroundColor: duplicateHover ? '#e0e0e0' : '#f0f0f0',
        border: '1px solid #ddd',
        borderRadius: '3px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        pointerEvents: 'auto',
      }"
      title="Duplicate this block"
      @mousedown="handleDuplicate"
      @mouseenter="duplicateHover = true"
      @mouseleave="duplicateHover = false"
    >
      📋 Duplicate
    </button>
    <button
      :style="{
        padding: '4px 8px',
        fontSize: '12px',
        backgroundColor: deleteHover ? '#ffcccc' : '#ffe6e6',
        border: '1px solid #ffcccc',
        borderRadius: '3px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        pointerEvents: 'auto',
      }"
      title="Delete this block"
      @mousedown="handleDelete"
      @mouseenter="deleteHover = true"
      @mouseleave="deleteHover = false"
    >
      🗑️ Delete
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  editor: {
    type: Object,
    required: true,
  },
  pos: {
    type: Object,
    required: true,
  },
  getPos: {
    type: Function,
    required: false,
    default: undefined,
  },
})

const hover = ref(false)
const duplicateHover = ref(false)
const deleteHover = ref(false)

function handleDuplicate(e) {
  e.preventDefault()
  e.stopPropagation()

  try {
    // Use getPos() to get the current position instead of stale pos
    const currentPos = typeof props.getPos === 'function' ? props.getPos() : props.pos.from
    if (currentPos === undefined) {
      return
    }

    const node = props.editor.state.doc.nodeAt(currentPos)
    if (node) {
      const { tr } = props.editor.state
      tr.insert(currentPos + node.nodeSize, node)
      props.editor.view.dispatch(tr)
      props.editor.view.focus()
    }
  } catch (error) {
    console.error('Error duplicating block:', error)
  }
}

function handleDelete(e) {
  e.preventDefault()
  e.stopPropagation()

  try {
    // Use getPos() to get the current position instead of stale pos
    const currentPos = typeof props.getPos === 'function' ? props.getPos() : props.pos.from
    if (currentPos === undefined) {
      return
    }

    const node = props.editor.state.doc.nodeAt(currentPos)
    if (node) {
      const { tr } = props.editor.state
      tr.delete(currentPos, currentPos + node.nodeSize)
      props.editor.view.dispatch(tr)
      props.editor.view.focus()
    }
  } catch (error) {
    console.error('Error deleting block:', error)
  }
}
</script>
