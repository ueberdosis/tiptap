<template>
  <div class="editor">
    <editor-content class="editor__content" :editor="editor" v-if="editor" />
  </div>
</template>

<script>
import io from 'socket.io-client'
import { debounce } from 'lodash-es'
import { Editor, EditorContent } from 'tiptap'
import { Step } from 'prosemirror-transform'
import { receiveTransaction, sendableSteps, getVersion } from 'prosemirror-collab'
import Collab from './Collab'

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
      socket: null,
    }
  },

  methods: {
    initEditor({ doc, version }) {
      if (this.editor) {
        this.editor.destroy()
      }

      this.editor = new Editor({
        content: doc,
        extensions: [
          new Collab({ version }),
        ],
        onUpdate: ({ state }) => {
          this.getSendableSteps(state)
        },
      })
    },

    getSendableSteps: debounce(function (state) {
      const sendable = sendableSteps(state)

      if (sendable) {
        this.socket.emit('update', sendable)
      }
    }, 250),

    receiveData({ steps, version }) {
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
    this.socket = io('wss://tiptap-sockets-2.glitch.me')
      .on('document', data => this.initEditor(data))
      .on('update', data => this.receiveData(data))
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
