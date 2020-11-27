<template>
  <editor-content :editor="editor" />
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-starter-kit'
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
      documentName: 'tiptap-collaboration-extension',
      ydoc: null,
      provider: null,
      type: null,
      editor: null,
    }
  },

  mounted() {
    this.ydoc = new Y.Doc()
    this.provider = new WebrtcProvider(this.documentName, this.ydoc)
    this.type = this.ydoc.getXmlFragment('prosemirror')

    this.editor = new Editor({
      // TODO: This is added by every new user.
      // content: `
      //   <p>Example Text</p>
      // `,
      extensions: [
        Document,
        Paragraph,
        Text,
        Collaboration.configure({
          type: this.type,
        }),
      ],
    })
  },

  beforeDestroy() {
    this.editor.destroy()
    this.provider.destroy()
  },
}
</script>
