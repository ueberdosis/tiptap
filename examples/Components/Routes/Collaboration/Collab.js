import { Extension } from 'tiptap'
import { collab } from 'prosemirror-collab'

export default class CollabExtension extends Extension {
  get name() {
    return 'collab'
  }

  get plugins() {
    return [collab()]
  }
}
