import { MarkType, NodeType, Schema } from 'prosemirror-model'

export default function getSchemaTypeByName(name: string, schema: Schema): NodeType | MarkType | null {
  if (schema.nodes[name]) {
    return schema.nodes[name]
  }

  if (schema.marks[name]) {
    return schema.marks[name]
  }

  return null
}
