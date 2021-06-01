<template>
  <node-view-wrapper class="draggable-item" :class="{ active: selected }">
    <div
      class="drag-handle"
      contenteditable="false"
      draggable="true"
      data-drag-handle
    />
    <div class="draggable-nested">
      <tiptap-nested />
    </div>
  </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper } from '@tiptap/vue-2'
import TiptapNested from './Nested.vue'

export default {
  name: 'CustomNode',

  components: {
    NodeViewWrapper,
    TiptapNested,
  },

  props: {
    editor: {
      type: Object,
      default: () => {},
    },

    node: {
      type: Object,
      default: () => {},
    },

    decorations: {
      type: Array,
      default: () => [],
    },

    selected: {
      type: Boolean,
      default: false,
    },

    extension: {
      type: Object,
      default: () => {},
    },

    getPos: {
      type: Function,
      default: () => {},
    },

    updateAttributes: {
      type: Function,
      default: () => {},
    },
  },
}
</script>

<style lang="scss">
.draggable-item {
  display: flex;
  flex-wrap: wrap;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1), 0px 10px 20px rgba(0, 0, 0, 0.1);

  &.active {
    border: 1px red solid;
  }

  input {
    margin: 0 0 0.5rem 0;
  }

  .drag-handle {
    flex: 0 0 auto;
    position: relative;
    width: 1rem;
    height: 1rem;
    top: 0.3rem;
    margin-right: 0.5rem;
    cursor: grab;
    background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 16"><path fill-opacity="0.2" d="M4 14c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM2 6C.9 6 0 6.9 0 8s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6C.9 0 0 .9 0 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>');
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
  }

  .content {
    flex: 1 1 auto;
  }
}

.draggable-nested {
  flex: 1
}
</style>
