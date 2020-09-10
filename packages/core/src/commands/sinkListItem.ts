import { Editor } from '../Editor'
import { sinkListItem } from 'prosemirror-schema-list'
import { NodeType } from 'prosemirror-model'
import getNodeType from '../utils/getNodeType'

type SinkListItem = (typeOrName: string | NodeType) => Editor

declare module '../Editor' {
  interface Editor {
    sinkListItem: SinkListItem,
  }
}

export default (next: Function, editor: Editor) => (typeOrName: string | NodeType) => {
  const { view, state, schema } = editor
  const type = getNodeType(typeOrName, schema)

  sinkListItem(type)(state, view.dispatch)
  next()
}
