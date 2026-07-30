<template>
  <node-view-wrapper class="react-component">
    <label contenteditable="false"> Vue Decorations (rendered: {{ renderCount }}x) </label>

    <node-view-content class="content is-editable" />

    <div class="toolbar" contenteditable="false">
      <button @click="toggleHighlight">
        {{ node.attrs.highlight ? 'Remove Decorations' : 'Add Decorations' }}
      </button>
      <button @click="showPosition">Show Position</button>
    </div>
  </node-view-wrapper>
</template>

<script>
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

export default {
  props: nodeViewProps,

  components: {
    NodeViewWrapper,
    NodeViewContent,
  },

  data() {
    return {
      renderCount: 1,
    }
  },

  updated() {
    this.renderCount += 1
  },

  methods: {
    toggleHighlight() {
      this.updateAttributes({
        highlight: !this.node.attrs.highlight,
      })
    },
    showPosition() {
      alert(`Current position: ${this.getPos()}`)
    },
  },
}
</script>

<style lang="scss">
.react-component {
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

  .toolbar {
    padding: 0 1rem 1rem;
    display: flex;
    gap: 0.5rem;

    button {
      background-color: var(--purple);
      border: none;
      border-radius: 0.25rem;
      color: var(--white);
      cursor: pointer;
      font-size: 0.85rem;
      padding: 0.5rem 1rem;

      &:hover {
        opacity: 0.8;
      }
    }
  }
}

.highlight-decoration {
  background-color: rgba(255, 230, 0, 0.4);
  border-radius: 0.15rem;
  padding: 0.1rem 0;
}
</style>
