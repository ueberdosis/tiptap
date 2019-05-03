import { Extension } from 'tiptap'
import { collab, sendableSteps } from 'prosemirror-collab'
import { debounce } from 'lodash-es'

export default class CollabExtension extends Extension {

  get name() {
    return 'collab'
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
      onSend: () => {},
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
      this.options.onSend(sendable)
    }
  }, this.options.debounce)

}
