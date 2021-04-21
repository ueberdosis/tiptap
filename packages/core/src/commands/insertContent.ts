import createNodeFromContent from '../helpers/createNodeFromContent'
import selectionToInsertionEnd from '../helpers/selectionToInsertionEnd'
import { Command, RawCommands, Content } from '../types'

declare module '@tiptap/core' {
  interface Commands {
    insertContent: {
      /**
       * Insert a node or string of HTML at the current position.
       */
      insertContent: (value: Content) => Command,
    }
  }
}

export const insertContent: RawCommands['insertContent'] = value => ({ tr, dispatch, editor }) => {
  if (dispatch) {
    const content = createNodeFromContent(value, editor.schema)

    if (typeof content === 'string') {
      tr.insertText(content)
      tr.scrollIntoView()

      return true
    }

    if (!tr.selection.empty) {
      tr.deleteSelection()
    }

    tr.insert(tr.selection.anchor, content)
    selectionToInsertionEnd(tr, tr.steps.length - 1, -1)
    tr.scrollIntoView()
  }

  return true
}
