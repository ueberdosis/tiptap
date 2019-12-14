<template>
  <Layout>
    <h1>{{ $page.post.title }}</h1>
    <VueRemarkContent />

    <div ref="editor"></div>
  </Layout>
</template>

<page-query>
query Post ($id: ID!) {
  post(id: $id) {
    title
  }
}
</page-query>

<script>
import Editor from '@tiptap/core'

export default {
  mounted() {
    // console.log(tiptap())


    new Editor({
      element: this.$refs.editor,
      content: '<p>test <strong>strong</strong></p>',
    })
      // .registerCommand('lol', (next) => {
      //   console.log('lol')
      //   next()
      // })
      // .focus('end')
      // .insertText('mega ')
      // .focus('start')
      // .command('insertText', 'giga ')
      // .lol()

      // .registerCommand('insertHTML', (next, editor, html) => {
      //   console.log(html)
      //   next()
      // })
      .focus('start')
      .insertText('<p>start</p>')
      .focus('end')
      .insertHTML('<p>end</p>')
  }
}
</script>