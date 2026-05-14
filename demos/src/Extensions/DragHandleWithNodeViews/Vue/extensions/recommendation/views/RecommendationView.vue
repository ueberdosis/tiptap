<template>
  <node-view-wrapper data-drag-handle class="node-recommendation">
    <div class="title">Recommendation {{ node.attrs.id }}</div>
    <p>Test</p>
    <small style="opacity: 0.5">pos: {{ getPos() }}</small>
  </node-view-wrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

export default {
  components: {
    NodeViewWrapper,
  },

  props: nodeViewProps,
}
</script>
