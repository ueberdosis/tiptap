<template>
  <div class="editor">
    <editor-content class="editor__content" :editor="editor" />
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
      ws: null,

      authority: {
        steps: [],
        stepClientIDs: [],
      },

      editor: new Editor({
        content: 'Collaboration!',
        extensions: [new Collab()],
        onUpdate: ({ state }) => {
          const sendable = sendableSteps(state)

          if (sendable) {
            this.ws.send(JSON.stringify(sendable))
          }
        },
      }),
    }
  },

  methods: {
    receiveData({ version, steps, clientID }) {
      if (version !== this.authority.steps.length) {
        return
      }

      steps.forEach(step => {
        this.authority.steps.push(step)
        this.authority.stepClientIDs.push(clientID)
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
      return {
        steps: this.authority.steps.slice(version),
        clientIDs: this.authority.stepClientIDs.slice(version),
      }
    },
  },

  mounted() {
    this.ws = new WebSocket('wss://tiptap-sockets.glitch.me')

    this.ws.onmessage = event => {
      this.receiveData(JSON.parse(event.data))
    }
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
