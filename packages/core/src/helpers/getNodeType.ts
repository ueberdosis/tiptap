import { NodeType, Schema } from 'prosemirror-model'

export default function getNodeType(nameOrType: string | NodeType, schema: Schema): NodeType {
  if (typeof nameOrType === 'string') {
    return schema.nodes[nameOrType]
  }

  return nameOrType
}
