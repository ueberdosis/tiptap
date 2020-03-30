import { Mark } from '@tiptap/core'
import { toggleMark } from 'prosemirror-commands'

export default class Italic extends Mark {

  name = 'italic'

  created() {
    this.editor.registerCommand('italic', (next, { view }) => {
      toggleMark(this.schemaType)(view.state, view.dispatch)
      next()
    })
  }

  schema() {
    return {
      parseDOM: [
        { tag: 'i' },
        { tag: 'em' },
        { style: 'font-style=italic' },
      ],
      toDOM: () => ['em', 0],
    }
  }

}