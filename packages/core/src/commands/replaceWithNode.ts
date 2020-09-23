import { Command } from '../Editor'
import { NodeType } from 'prosemirror-model'
import getNodeType from '../utils/getNodeType'

interface Range {
  from: number,
  to: number,
}

type ReplaceWithNodeCommand = (
  typeOrName: NodeType,
  attrs: {},
  range?: Range,
) => Command

declare module '../Editor' {
  interface Commands {
    replaceText: ReplaceWithNodeCommand,
  }
}

export const replaceWithNode: ReplaceWithNodeCommand = (typeOrName, attrs = {}, range) => ({ view, tr, state }) => {
  const { $from, $to } = tr.selection
  const type = getNodeType(typeOrName, state.schema)
  const index = $from.index()
  const from = range ? range.from : $from.pos
  const to = range ? range.to : $to.pos

  if (!$from.parent.canReplaceWith(index, index, type)) {
    return false
  }
  
  view.dispatch(tr.replaceWith(from, to, type.create(attrs)))

  return true
}
