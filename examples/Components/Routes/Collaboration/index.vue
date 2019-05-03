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
import { Collaboration } from 'tiptap-extensions'

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
          new Collaboration({
            version,
            debounce: 250,
            onSendable: data => {
              this.socket.emit('update', data)
            },
          }),
        ],
      })
    },
  },

  mounted() {
    this.socket = io('wss://tiptap-sockets.glitch.me')
      .on('init', data => this.onInit(data))
      .on('update', data => this.editor.extensions.options.collaboration.onUpdate(data))
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
