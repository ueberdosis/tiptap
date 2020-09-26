<template>
  <div>
    <editor-content :editor="editor" />

    <div class="collaboration-status">
      {{ numberOfConnectedUsers }} user{{ numberOfConnectedUsers === 1 ? '' : 's' }}
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      ydoc: null,
      provider: null,
      type: null,
      numberOfConnectedUsers: 0,
      editor: null,
    }
  },

  mounted() {
    this.ydoc = new Y.Doc()
    this.provider = new WebrtcProvider('example', this.ydoc)
    this.type = this.ydoc.getXmlFragment('prosemirror')
    this.provider.on('peers', ({ bcPeers, webrtcPeers }) => {
      this.numberOfConnectedUsers = bcPeers.length + webrtcPeers.length
    })

    this.editor = new Editor({
      // TODO: This is added by every new user.
      // content: `
      //   <p>Example Text</p>
      // `,
      extensions: [
        Document(),
        Paragraph(),
        Text(),
        Collaboration({
          provider: this.provider,
          type: this.type,
        }),
        CollaborationCursor({
          provider: this.provider,
          name: 'Other User',
          color: '#d6336c',
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

<style lang="scss" src="./style.scss">
