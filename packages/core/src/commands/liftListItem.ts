import { Editor } from '../Editor'
import { liftListItem } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import getNodeType from '../utils/getNodeType'

type LiftListItem = (typeOrName: string | NodeType) => Editor

declare module '../Editor' {
  interface Editor {
    liftListItem: LiftListItem,
  }
}

export default (next: Function, editor: Editor) => (typeOrName: string | NodeType) => {
  const { view, state, schema } = editor
  const type = getNodeType(typeOrName, schema)

  liftListItem(type)(state, view.dispatch)
  next()
}
