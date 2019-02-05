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
      clientID: Math.floor(Math.random() * 0xFFFFFFFF),
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
          new Collab({
            version,
            clientID: this.clientID,
          }),
        ],
        onUpdate: ({ state }) => {
          this.getSendableSteps(state)
        },
      })
    },

    getSendableSteps: debounce(function (state) {
      const sendable = sendableSteps(state)

      this.prevState = state

      if (sendable) {
        this.socket.emit('update', sendable)

        const transaction = receiveTransaction(
          this.editor.state,
          sendable.steps,
          this.repeat(sendable.clientID, sendable.steps.length),
        )

        this.editor.view.dispatch(transaction)
      }
    }, 250),

    receiveData({ steps }) {
      const { state, view, schema } = this.editor

      const transaction = receiveTransaction(
        state,
        steps.map(step => Step.fromJSON(schema, step)),
        steps.map(step => step.clientID),
      )

      view.dispatch(transaction)
    },

    repeat(val, n) {
      const result = []
      for (let i = 0; i < n; i++) result.push(val)
      return result
    },
  },

  mounted() {
    this.socket = io('wss://tiptap-sockets-2.glitch.me')
      .on('connect', () => {
        console.log('connected')
      })
      .on('disconnect', () => {
        console.log('disconnected')
      })
      .on('document', data => {
        this.initEditor(data)
      })
      .on('update', data => {
        this.receiveData(data)
      })
      .on('versionMismatch', () => {
        // set state to the latest synced version?
        // this.editor.view.updateState(this.prevState)

        const currentVersion = getVersion(this.editor.state)
        console.log('should poll version', currentVersion)

        this.socket.emit('getVersionSteps', currentVersion)
      })
      .on('versionSteps', data => {
        console.log('versionSteps', data)
        const { state, view, schema } = this.editor

        const transaction = receiveTransaction(
          state,
          data.map(item => Step.fromJSON(schema, item.step)),
          data.map(item => item.clientID),
        )

        view.dispatch(transaction)
      })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
