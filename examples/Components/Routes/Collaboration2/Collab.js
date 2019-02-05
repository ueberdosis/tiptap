import { Extension } from 'tiptap'
import { collab } from 'prosemirror-collab'

export default class CollabExtension extends Extension {
  get name() {
    return 'collab'
  }

  get defaultOptions() {
    return {
      version: 0,
      clientID: Math.floor(Math.random() * 0xFFFFFFFF),
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
}
