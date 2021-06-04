import { NodeType } from 'prosemirror-model'
import getNodeType from '../helpers/getNodeType'
import { RawCommands, Range } from '../types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    replaceRange: {
      /**
       * Replaces text with a node within a range.
       */
      replaceRange: (range: Range, typeOrName: string | NodeType, attributes?: Record<string, any>) => ReturnType,
    }
  }
}

export const replaceRange: RawCommands['replaceRange'] = (range, typeOrName, attributes = {}) => ({ tr, state, dispatch }) => {
  console.warn('[tiptap warn]: replaceRange() is deprecated. please use insertContent() instead.')

  const type = getNodeType(typeOrName, state.schema)
  const { from, to } = range
  // const $from = tr.doc.resolve(from)
  // const index = $from.index()

  // if (!$from.parent.canReplaceWith(index, index, type)) {
  //   return false
  // }

  if (dispatch) {
    tr.replaceRangeWith(from, to, type.create(attributes))
  }

  return true
}
