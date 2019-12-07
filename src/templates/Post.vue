<template>
  <Layout>
    <h1>{{ $page.post.title }}</h1>
    <VueRemarkContent />
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

    // new Editor()
    //   .registerCommand('lol', (next) => {
    //   console.log('lol')
    //   next()
    // })
    // .focus('end')
    // .insertText('mega ')
    // .focus('start')
    // .command('insertText', 'giga ')
    // .lol()
  }
}
</script>