<template>
  <node-view-wrapper class="vue-component">
    <label>Vue Component</label>

    <div class="content">
      <button @click="increase">
        This button has been clicked {{ node.attrs.count }} times.
      </button>
    </div>
  </node-view-wrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

export default {
  components: {
    NodeViewWrapper,
  },

  props: nodeViewProps,

  methods: {
    increase() {
      this.updateAttributes({
        count: this.node.attrs.count + 1,
      })
    },
  },
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
    }
  }
}
</style>
