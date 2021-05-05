import createNodeFromContent from '../helpers/createNodeFromContent'
import selectionToInsertionEnd from '../helpers/selectionToInsertionEnd'
import {
  Command, RawCommands, Content, Range,
} from '../types'

declare module '@tiptap/core' {
  interface Commands {
    insertContentAt: {
      /**
       * Insert a node or string of HTML at the current position.
       */
      insertContentAt: (range: Range, value: Content) => Command,
    }
  }
}

export const insertContentAt: RawCommands['insertContentAt'] = (range, value) => ({ tr, dispatch, editor }) => {
  if (dispatch) {
    const content = createNodeFromContent(value, editor.schema)

    if (typeof content === 'string') {
      tr.insertText(content)
      tr.scrollIntoView()

      return true
    }

    if (!tr.selection.empty) {
      tr.deleteRange(range.from, range.to)
    }

    tr.insert(range.from, content)
    selectionToInsertionEnd(tr, tr.steps.length - 1, -1)
    tr.scrollIntoView()
  }

  return true
}
