<template>
  <node-view-wrapper>
    <button @click="toggleChecked" contenteditable="false">
      toggle checked
    </button>
    <div contenteditable="false">
      checked: {{ node.attrs.checked }}
    </div>
    <div contenteditable="false" style="width: 20px; height: 20px; background: red" data-drag-handle />
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
    // setInterval(() => {
    //   this.random = `foo${Math.random()}`
    // }, 1000)
  },
}
</script>
