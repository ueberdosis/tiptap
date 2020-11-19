<template>
  <!-- <div style="white-space: normal;">
    node view
    <button @click="editor.chain().focus().insertText('hey').run()">
      button
    </button>
    <div>
      attrs {{ node.attrs }}
    </div>
    <inner />
  </div> -->
  <!-- <inner /> -->
  <div style="white-space: normal;">
    <button @click="toggleChecked">
      toggle checked
    </button>
    hey {{ node.attrs.checked }}
    <inner />
  </div>

  <!-- <inner as="p" :class="random" foo="bar" /> -->
  <!-- <component :is="inner" as="p" /> -->
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

    inner: {
      type: [Object, Function],
      required: true,
    },

    updateAttrs: {
      type: Function,
      required: true,
    },
  },

  data() {
    return {
      random: 'foo',
    }
  },

  methods: {
    toggleChecked() {
      this.editor.commands.focus()
      this.updateAttrs({
        checked: !this.node.attrs.checked,
      })
    },
  },

  mounted() {
    // console.log(this.node)

    console.log('mounted')
    // setInterval(() => {
    //   this.random = `foo${Math.random()}`
    // }, 1000)
    // console.log(this)
  },
}
</script>

<style>

</style>
