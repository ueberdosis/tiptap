<template>
  <node-view-wrapper as="p" data-drag-handle />
</template>

<script>
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-2'

export default {
  components: {
    NodeViewWrapper,
  },

  props: nodeViewProps,

  mounted() {
    console.log('mount paragraph component', this.getPos(), this.node.textContent)
  },

  beforeDestroy() {
    console.log('unmount paragraph component')
  },
}
</script>

<style>

</style>
