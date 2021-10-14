import { ParseOptions } from 'prosemirror-model'
import createNodeFromContent from '../helpers/createNodeFromContent'
import selectionToInsertionEnd from '../helpers/selectionToInsertionEnd'
import {
  RawCommands,
  Content,
  Range,
} from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insertContentAt: {
      /**
       * Insert a node or string of HTML at a specific position.
       */
      insertContentAt: (
        position: number | Range,
        value: Content,
        options?: {
          parseOptions?: ParseOptions,
          updateSelection?: boolean,
        },
      ) => ReturnType,
    }
  }
}

export const insertContentAt: RawCommands['insertContentAt'] = (position, value, options) => ({ tr, dispatch, editor }) => {
  if (dispatch) {
    options = {
      parseOptions: {},
      updateSelection: true,
      ...options,
    }

    const content = createNodeFromContent(value, editor.schema, {
      parseOptions: {
        preserveWhitespace: 'full',
        ...options.parseOptions,
      },
    })

    // don’t dispatch an empty fragment because this can lead to strange errors
    if (content.toString() === '<>') {
      return true
    }

    const { from, to } = typeof position === 'number'
      ? { from: position, to: position }
      : position

    tr.replaceWith(from, to, content)

    // set cursor at end of inserted content
    if (options.updateSelection) {
      selectionToInsertionEnd(tr, tr.steps.length - 1, 1)
    }
  }

  return true
}
