<template>
  <node-view-wrapper as="span" data-drag-handle>
    <span @click="handleClick">
      image
    </span>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-2'

export default {
  components: {
    NodeViewWrapper,
  },

  props: nodeViewProps,

  methods: {
    handleClick() {
      console.log('clicked node view with pos', this.getPos())
    },
  },

  mounted() {
    console.log('mount component')
  },

  beforeDestroy() {
    console.log('unmount component')
  },
}
</script>

<style>

</style>
