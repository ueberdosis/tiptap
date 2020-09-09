import { NodeSpec, NodeType } from 'prosemirror-model'
import Extension, { ExtensionCallback, ExtensionExtends } from './Extension'
import { Editor } from './Editor'

interface Callback {
  name: string
  editor: Editor
  options: any
  type: NodeType
}

export interface NodeExtends extends ExtensionExtends<Callback> {
  topNode: boolean
  schema: (params: Callback) => NodeSpec
}

export default class Node<Options = {}> extends Extension<Options, Callback, NodeExtends> {
  type = 'node'

  public topNode(value: NodeExtends['topNode'] = true) {
    this.storeConfig('topNode', value, 'overwrite')
    return this
  }

  public schema(value: NodeExtends['schema']) {
    this.storeConfig('schema', value, 'overwrite')
    return this
  }
}
