<template>
  <div v-if="editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import Collaboration from '@tiptap/extension-collaboration'
import { Editor, EditorContent } from '@tiptap/vue-starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import Paper from './Paper.js'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
    }
  },

  mounted() {
    const ydoc = new Y.Doc()
    const provider = new WebsocketProvider('wss://websocket.tiptap.dev', 'tiptap-draw-example', ydoc)

    this.editor = new Editor({
      extensions: [
        Document.extend({
          content: 'paper paragraph',
        }),
        Paragraph,
        Text,
        Collaboration.configure({
          provider,
        }),
        Paper,
      ],
    })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
