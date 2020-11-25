<template>
  <node-view-wrapper class="item">
    <!-- <button @click="toggleChecked" contenteditable="false">
      toggle checked
    </button>
    <div contenteditable="false">
      checked: {{ node.attrs.checked }}
    </div> -->

    <div data-drag-handle class="drag-handle" contenteditable="false" />
    <node-view-content />
  </node-view-wrapper>
</template>

<script>
export default {
  props: {
    editor: {
      type: Object,
      required: true,
    },

    node: {
      type: Object,
      required: true,
    },

    updateAttributes: {
      type: Function,
      required: true,
    },
  },

  data() {
    return {
      // random: 'foo',
    }
  },

  methods: {
    toggleChecked() {
      // this.editor.commands.focus()
      this.updateAttributes({
        checked: !this.node.attrs.checked,
      })
    },
  },

  mounted() {
    console.log('MOUNTED')
    // setInterval(() => {
    //   this.random = `foo${Math.random()}`
    // }, 1000)
  },
}
</script>

<style lang="scss">
.item {
  padding: 0.5rem;
  margin: 1rem 0;
  border-radius: 0.5rem;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.1),
    0px 10px 20px rgba(0, 0, 0, 0.1),
  ;
}

.drag-handle {
  width: 1rem;
  height: 1rem;
  cursor: grab;
  background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 16"><path fill-opacity="0.4" d="M4 14c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM2 6C.9 6 0 6.9 0 8s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6C.9 0 0 .9 0 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>');
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
}
</style>
