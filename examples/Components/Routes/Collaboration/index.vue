<template>
  <div class="editor">
    <editor-content class="editor__content" :editor="editor" v-if="editor" />
  </div>
</template>

<script>
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
      ws: null,
      clientID: Math.floor(Math.random() * 0xFFFFFFFF),
      collabStartVersion: 0,
      collabHistory: {
        steps: [],
        clientIDs: [],
      },
    }
  },

  methods: {
    initEditor({ doc, version }) {
      this.collabStartVersion = version + 1

      this.editor = new Editor({
        content: doc,
        extensions: [
          new Collab({
            version: this.collabStartVersion,
            clientID: this.clientID,
          }),
        ],
        onUpdate: ({ state }) => {
          const sendable = sendableSteps(state)

          if (sendable) {
            this.ws.send(JSON.stringify(sendable))
          }
        },
      })
    },

    receiveData({ version, steps, clientID }) {
      if (version !== this.collabHistory.steps.length + this.collabStartVersion) {
        return
      }

      steps.forEach(step => {
        this.collabHistory.steps.push(step)
        this.collabHistory.clientIDs.push(clientID)
      })

      this.updateDoc()
    },

    updateDoc() {
      const { state, view, schema } = this.editor
      const version = getVersion(state)
      const data = this.stepsSince(version)
      const transaction = receiveTransaction(
        state,
        data.steps.map(step => Step.fromJSON(schema, step)),
        data.clientIDs,
      )

      view.dispatch(transaction)
    },

    stepsSince(version) {
      const count = version - this.collabStartVersion
      return {
        steps: this.collabHistory.steps.slice(count),
        clientIDs: this.collabHistory.clientIDs.slice(count),
      }
    },
  },

  mounted() {
    this.ws = new WebSocket('wss://tiptap-sockets.glitch.me')

    this.ws.onmessage = event => {
      const payload = JSON.parse(event.data)

      if (payload.doc) {
        this.initEditor(payload)
      } else {
        this.receiveData(payload)
      }
    }
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
