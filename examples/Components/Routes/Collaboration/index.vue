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
import { Step } from 'prosemirror-transform'
import { receiveTransaction, getVersion } from 'prosemirror-collab'
import Collab from './Collab'

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
          new Collab({
            version,
            debounce: 250,
            onSend: sendable => {
              this.socket.emit('update', sendable)
            },
          }),
        ],
      })

      // console.log(this.editor.extensions.options.collab.version)
    },

    onUpdate({ steps, version }) {
      const { state, view, schema } = this.editor

      if (getVersion(state) > version) {
        return
      }

      view.dispatch(receiveTransaction(
        state,
        steps.map(item => Step.fromJSON(schema, item.step)),
        steps.map(item => item.clientID),
      ))
    },
  },

  mounted() {
    this.socket = io('wss://tiptap-sockets.glitch.me')
      .on('init', data => this.onInit(data))
      .on('update', data => this.onUpdate(data))
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
