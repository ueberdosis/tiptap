import { NodeSpec, NodeType } from 'prosemirror-model'
import Extension, { ExtensionCallback, ExtensionExtends } from './Extension'

// export default abstract class Node extends Extension {

//   constructor(options = {}) {
//     super(options)
//   }

//   public extensionType = 'node'

//   public topNode = false

//   abstract schema(): NodeSpec

//   get type() {
//     return this.editor.schema.nodes[this.name]
//   }

// }

export interface NodeCallback extends ExtensionCallback {
  // TODO: fix optional
  type?: NodeType
}

export interface NodeExtends<Callback = NodeCallback> extends ExtensionExtends<Callback> {
  topNode: boolean
  schema: (params: Callback) => NodeSpec
}

export default class Node<Options = {}> extends Extension<Options, NodeExtends> {
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
