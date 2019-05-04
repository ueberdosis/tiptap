<template>
  <div class="editor">
    <editor-content class="editor__content" :editor="editor" v-if="editor && !loading" />
    <em v-else>
      Connecting to socket server …
    </em>
  </div>
</template>

<script>
import io from 'socket.io-client'
import { Editor, EditorContent } from 'tiptap'
import { History, Collaboration } from 'tiptap-extensions'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      loading: true,
      editor: null,
      socket: null,
    }
  },

  methods: {
    onInit({ doc, version }) {
      this.loading = false

      if (this.editor) {
        this.editor.destroy()
      }

      this.editor = new Editor({
        content: doc,
        extensions: [
          new History(),
          new Collaboration({
            // the initial version we start with
            // version is an integer which is incremented with every change
            version,
            // debounce changes so we can save some bandwidth
            debounce: 250,
            // onSendable is called whenever there are changed we have to send to our server
            onSendable: data => {
              this.socket.emit('update', data)
            },
          }),
        ],
      })
    },
  },

  mounted() {
    // server implementation: https://glitch.com/edit/#!/tiptap-sockets
    this.socket = io('wss://tiptap-sockets.glitch.me')
      // get the current document and its version
      .on('init', data => this.onInit(data))
      // send all updates to the collaboration extension
      .on('update', data => this.editor.extensions.options.collaboration.update(data))
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
