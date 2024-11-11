<template>
  <NodeViewWrapper>
    <label>Vue Component</label>

    <div class="content">
      <button @click="increase">This button has been clicked {{ node.attrs.count }} times.</button>
    </div>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

function increase() {
  props.updateAttributes({
    count: props.node.attrs.count + 1,
  })
}
</script>
