import { NodeType } from 'prosemirror-model'
import getNodeType from '../helpers/getNodeType'
import {
  Command,
  RawCommands,
  Range,
  AnyObject,
} from '../types'

declare module '@tiptap/core' {
  interface AllCommands {
    replaceRange: {
      /**
       * Replaces text with a node within a range.
       */
      replaceRange: (range: Range, typeOrName: string | NodeType, attributes?: AnyObject) => Command,
    }
  }
}

export const replaceRange: RawCommands['replaceRange'] = (range, typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)
  const { from, to } = range
  const $from = tr.doc.resolve(from)
  const index = $from.index()

  if (!$from.parent.canReplaceWith(index, index, type)) {
    return false
  }

  if (dispatch) {
    tr.replaceWith(from, to, type.create(attributes))
  }

  return true
}
