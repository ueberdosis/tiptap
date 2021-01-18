import { NodeType } from 'prosemirror-model'
import getNodeType from '../helpers/getNodeType'
import { Command } from '../types'

export type Range = {
  from: number,
  to: number,
}

/**
 * Replaces text with a node within a range.
 */
export const replace = (range: Range | null = null, typeOrName: string | NodeType, attrs = {}): Command => ({ tr, state, dispatch }) => {
  const type = getNodeType(typeOrName, state.schema)
  const { $from, $to } = state.selection
  const index = $from.index()
  const from = range ? range.from : $from.pos
  const to = range ? range.to : $to.pos

  if (!$from.parent.canReplaceWith(index, index, type)) {
    return false
  }

  if (dispatch) {
    tr.replaceWith(from, to, type.create(attrs))
  }

  return true
}
