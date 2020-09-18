import { NodeSpec, NodeType } from 'prosemirror-model'
import Extension, { ExtensionMethods } from './Extension'
import { Editor } from './Editor'

export interface NodeProps<Options> {
  name: string
  editor: Editor
  options: Options
  type: NodeType
}

export interface NodeMethods<Props, Options> extends ExtensionMethods<Props, Options> {
  topNode: boolean
  schema: (params: Omit<Props, 'type' | 'editor'>) => NodeSpec
}

export default class Node<
  Options = {},
  Props = NodeProps<Options>,
  Methods extends NodeMethods<Props, Options> = NodeMethods<Props, Options>
> extends Extension<Options, Props, Methods> {
  type = 'node'

  public topNode(value: Methods['topNode'] = true) {
    this.storeConfig('topNode', value, 'overwrite')
    return this
  }

  public schema(value: Methods['schema']) {
    this.storeConfig('schema', value, 'overwrite')
    return this
  }
}
