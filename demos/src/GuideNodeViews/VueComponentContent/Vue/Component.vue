<template>
  <node-view-wrapper class="vue-component">
    <label contenteditable="false">Vue Component</label>
    <node-view-content class="content is-editable" />
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
.tiptap {
  /* Vue component */
  .vue-component {
    background-color: var(--purple-light);
    border: 2px solid var(--purple);
    border-radius: 0.5rem;
    margin: 2rem 0;
    position: relative;

    label {
      background-color: var(--purple);
      border-radius: 0 0 0.5rem 0;
      color: var(--white);
      font-size: 0.75rem;
      font-weight: bold;
      padding: 0.25rem 0.5rem;
      position: absolute;
      top: 0;
    }

    .content {
      margin-top: 1.5rem;
      padding: 1rem;

      &.is-editable {
        border: 2px dashed var(--gray-3);
        border-radius: 0.5rem;
        margin: 2.5rem 1rem 1rem;
        padding: 0.5rem;
      }
    }
  }
}
</style>
