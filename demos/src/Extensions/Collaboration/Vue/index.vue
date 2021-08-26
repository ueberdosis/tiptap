<template>
  <editor-content :editor="editor" />
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      provider: null,
    }
  },

  mounted() {
    const ydoc = new Y.Doc()
    this.provider = new WebrtcProvider('tiptap-collaboration-extension', ydoc)

    this.editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Collaboration.configure({
          document: ydoc,
        }),
      ],
    })
  },

  beforeUnmount() {
    this.editor.destroy()
    this.provider.destroy()
  },
}
</script>
