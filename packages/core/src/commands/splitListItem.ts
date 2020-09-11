import { Editor } from '../Editor'
import { splitListItem } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import getNodeType from '../utils/getNodeType'

type SplitListItem = (typeOrName: string | NodeType) => Editor

declare module '../Editor' {
  interface Editor {
    splitListItem: SplitListItem,
  }
}

export default (next: Function, editor: Editor) => (typeOrName: string | NodeType) => {
  const { view, state, schema } = editor
  const type = getNodeType(typeOrName, schema)

  return splitListItem(type)(state, view.dispatch)
  // next()
}
