import { NodeSpec, NodeType } from 'prosemirror-model'
import Extension, { ExtensionCallback, ExtensionExtends } from './Extension'
import { Editor } from './Editor'

interface NodeCallback<Options> {
  name: string
  editor: Editor
  options: Options
  type: NodeType
}

export interface NodeExtends<Callback, Options> extends ExtensionExtends<Callback, Options> {
  topNode: boolean
  schema: (params: Callback) => NodeSpec
}

export default class Node<
  Options = {},
  Callback = NodeCallback<Options>,
  Extends extends NodeExtends<Callback, Options> = NodeExtends<Callback, Options>
> extends Extension<Options, Callback, Extends> {
  type = 'node'

  public topNode(value: Extends['topNode'] = true) {
    this.storeConfig('topNode', value, 'overwrite')
    return this
  }

  public schema(value: Extends['schema']) {
    this.storeConfig('schema', value, 'overwrite')
    return this
  }
}
