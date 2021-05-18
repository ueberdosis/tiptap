import createNodeFromContent from '../helpers/createNodeFromContent'
import selectionToInsertionEnd from '../helpers/selectionToInsertionEnd'
import {
  Command,
  RawCommands,
  Content,
  Range,
} from '../types'

declare module '@tiptap/core' {
  interface Commands {
    insertContentAt: {
      /**
       * Insert a node or string of HTML at a specific position.
       */
      insertContentAt: (position: number | Range, value: Content) => Command,
    }
  }
}

export const insertContentAt: RawCommands['insertContentAt'] = (position, value) => ({ tr, dispatch, editor }) => {
  if (dispatch) {
    const content = createNodeFromContent(value, editor.schema)
    const { from, to } = typeof position === 'number'
      ? { from: position, to: position }
      : position

    tr.replaceWith(from, to, content)

    // set cursor at end of inserted content
    selectionToInsertionEnd(tr, tr.steps.length - 1, 1)
  }

  return true
}
