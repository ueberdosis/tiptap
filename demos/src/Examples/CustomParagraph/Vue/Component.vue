<template>
  <node-view-wrapper class="vue-component">
    <span contenteditable="false" class="label">{{ node.textContent.length }}</span>
    <node-view-content as="p" />
  </node-view-wrapper>
</template>

<script>
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

export default {
  components: {
    NodeViewWrapper,
    NodeViewContent,
  },

  props: nodeViewProps,
}
</script>

<style lang="scss">
.vue-component {
  position: relative;
}

.label {
  position: absolute;
  right: 100%;
  font-size: 10px;
  color: #999;
}
</style>
