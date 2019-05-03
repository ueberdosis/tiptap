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
      history: [],
      editor: null,
      socket: null,
      newState: null,
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
        // onTransaction: transaction => {
        //   console.log('onTransaction')
        //   this.newState = this.editor.state.apply(transaction)
        //   this.editor.view.updateState(this.state.edit)
        //   return false
        // },
        onUpdate: ({ state, oldState }) => {
          this.getSendableSteps(state, oldState)
        },
      })
    },

    getSendableSteps: debounce(function (state, oldState) {
      const sendable = sendableSteps(state)

      console.log('update editor', { sendable })

      // console.log({ state, oldState })

      if (sendable) {
        this.socket.emit('update', sendable)

        const { steps } = sendable
        const clientIDs = this.repeat(sendable.clientID, steps.length)

        this.history.push({
          state: oldState,
          version: getVersion(state),
          steps,
          clientIDs,
        })

        const transaction = receiveTransaction(
          state,
          steps,
          clientIDs,
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
      .on('versionInSync', version => {
        console.log('version in sync', version)
        // TODO remove steps older than version
      })
      .on('versionMismatch', ({ version, data, doc }) => {
        console.log('version mismatch', version)
        // TODO: go back to `version`, apply `steps`, apply unmerged `steps`

        const history = this.history.find(item => item.version === version)

        const { state, view, schema } = this.editor

        // view.updateState(history.state)

        console.log('other steps', { data })
        // console.log(getVersion(view.state))

        const newstate = history.state.apply(receiveTransaction(
          history.state,
          data.map(item => Step.fromJSON(schema, item.step)),
          data.map(item => item.clientID),
        ))

        view.updateState(newstate)

        // const newstate2 = newstate.apply(receiveTransaction(
        //   newstate,
        //   history.steps,
        //   history.clientIDs,
        // ))

        view.dispatch(receiveTransaction(
          state,
          history.steps,
          history.clientIDs,
        ))

        // view.updateState(newstate2)

        // view.dispatch(receiveTransaction(
        //   view.state,
        //   data.map(item => Step.fromJSON(schema, item.step)),
        //   data.map(item => item.clientID),
        // ))

        // console.log('own', { history })

        // view.dispatch(receiveTransaction(
        //   history.state,
        //   history.steps,
        //   history.clientIDs,
        // ))

        // const transaction = receiveTransaction(
        //   state,
        //   steps,
        //   clientIDs,
        // )

        // this.editor.view.dispatch(transaction)
      })
      // .on('versionMismatch', (version, steps) => {
      //   // set state to the latest synced version?
      //   // this.editor.view.updateState(this.prevState)

      //   const currentVersion = getVersion(this.editor.state)
      //   console.log('should poll version', currentVersion)

      //   this.socket.emit('getVersionSteps', currentVersion)
      // })
      // .on('versionSteps', data => {
      //   console.log('versionSteps', data)
      //   const { state, view, schema } = this.editor

      //   const transaction = receiveTransaction(
      //     state,
      //     data.map(item => Step.fromJSON(schema, item.step)),
      //     data.map(item => item.clientID),
      //   )

      //   view.dispatch(transaction)
      // })
  },

  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>
