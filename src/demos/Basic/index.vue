<template>
  <Layout>
    <div ref="editor"></div>
  </Layout>
</template>

<script>
import Editor from '@tiptap/core'

export default {
  mounted() {
    new Editor({
      element: this.$refs.editor,
      content: '<p>foo</p>',
    })
  }
}
</script>