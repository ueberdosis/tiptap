import { debounce } from 'lodash-es'
import { Extension } from 'tiptap'
import { Step } from 'prosemirror-transform'
import {
  collab,
  sendableSteps,
  getVersion,
  receiveTransaction,
} from 'prosemirror-collab'

export default class CollaborationExtension extends Extension {

  get name() {
    return 'collaboration'
  }

  init() {
    this.editor.on('update', ({ state }) => {
      this.getSendableSteps(state)
    })
  }

  get defaultOptions() {
    return {
      version: 0,
      clientID: Math.floor(Math.random() * 0xFFFFFFFF),
      debounce: 250,
      onSendable: () => {},
      onUpdate: ({ steps, version }) => {
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
    }
  }

  get plugins() {
    return [
      collab({
        version: this.options.version,
        clientID: this.options.clientID,
      }),
    ]
  }

  getSendableSteps = debounce(state => {
    const sendable = sendableSteps(state)

    if (sendable) {
      this.options.onSendable(sendable)
    }
  }, this.options.debounce)

}
