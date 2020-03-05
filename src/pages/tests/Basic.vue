<template>
  <Layout>
    <div ref="editor"></div>
  </Layout>
</template>

<script>
import Editor from '@tiptap/core'
import Document from '@tiptap/document-extension'
import Paragraph from '@tiptap/paragraph-extension'
import Text from '@tiptap/text-extension'

export default {
  mounted() {
    window.editor = new Editor({
      element: this.$refs.editor,
      content: '<p>foo</p>',
      extensions: [
        new Document(),
        new Paragraph(),
        new Text(),
      ],
    })
    // .focus('end')
    // .insertText('foo')
    // .insertHTML('<p>hey</p>')
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
      // .registerCommand('insertHello', async (next, editor) => {
      //   await editor.insertHTML('<strong>HELLO</strong>')
      //   next()
      // })
      // .registerCommand('insertHello', (next, editor) => {
      //   editor
      //     .focus('start')
      //     .insertHTML('<strong>HELLO</strong>')
      //   next()
      // })
      // .focus('start')
      // .insertHello()
      // .insertText('eins')
      // .insertText('zwei')
      // .insertText('drei')
      // .insertHello()
      // .focus('end')
      // .insertHTML('<p>end</p>')
  }
}
</script>