import { NodeType, Schema } from '@tiptap/pm/model'

export function getNodeType(nameOrType: string | NodeType, schema: Schema): NodeType {
  if (typeof nameOrType === 'string') {
    if (!schema.nodes[nameOrType]) {
      throw Error(
        `There is no node type named '${nameOrType}'. Maybe you forgot to add the extension?`,
      )
    }

    return schema.nodes[nameOrType]
  }

  return nameOrType
}
