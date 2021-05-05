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
      insertContentAt: (range: Range, value: Content) => Command,
    }
  }
}

export const insertContentAt: RawCommands['insertContentAt'] = (range, value) => ({ tr, dispatch, editor }) => {
  if (dispatch) {
    const content = createNodeFromContent(value, editor.schema)

    tr.replaceWith(range.from, range.to, content)

    // set cursor at end of inserted content
    selectionToInsertionEnd(tr, tr.steps.length - 1, 1)
  }

  return true
}
