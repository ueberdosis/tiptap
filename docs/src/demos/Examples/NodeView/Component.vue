<template>
  <!-- <div style="white-space: normal;">
    node view
    <button @click="editor.chain().focus().insertText('hey').run()">
      button
    </button>
    <component :is="inner" />
    <inner />
  </div> -->
  <inner as="p" class="hey" foo="bar" />
  <!-- <component :is="inner" as="p" /> -->
</template>

<script>
export default {
  props: {
    editor: {
      type: Object,
      required: true,
    },

    inner: {
      type: [Object, Function],
      required: true,
    },
  },

  data() {
    return {
      foo: 'foo',
    }
  },

  mounted() {
    // console.log(this)
  },
}
</script>

<style>

</style>
