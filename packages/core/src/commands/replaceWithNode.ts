import { Editor } from '../Editor'
import { NodeType } from 'prosemirror-model'
import getNodeType from '../utils/getNodeType'

interface Range {
  from: number,
  to: number,
}

type ReplaceWithNode = (
  type: NodeType,
  attrs: {},
  range?: Range,
) => any

declare module '../Editor' {
  interface Editor {
    replaceText: ReplaceWithNode,
  }
}

export default (next: Function, editor: Editor): ReplaceWithNode => (typeOrName, attrs, range) => {
  const { view, state, schema } = editor
  const { $from, $to } = state.selection
  const type = getNodeType(typeOrName, schema)
  const index = $from.index()
  const from = range ? range.from : $from.pos
  const to = range ? range.to : $to.pos

  if ($from.parent.canReplaceWith(index, index, type)) {
    view.dispatch(state.tr.replaceWith(from, to, type.create(attrs)))
  }

  next()
}
