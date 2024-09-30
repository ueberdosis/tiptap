<template>
  <NodeViewWrapper ref="wrapper">
    <label>Vue Component</label>

    <div class="content">
      <button @click="increase">This button has been clicked {{ node.attrs.count }} times.</button>
    </div>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import { ref } from 'vue'

const props = defineProps(nodeViewProps)

const wrapper = ref<InstanceType<typeof NodeViewWrapper> | null>(null)

function increase() {
  if (!wrapper.value) { return }

  props.updateAttributes({
    count: props.node.attrs.count + 1,
  })
}
</script>
