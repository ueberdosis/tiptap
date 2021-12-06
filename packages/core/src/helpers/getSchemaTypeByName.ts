import { MarkType, NodeType, Schema } from 'prosemirror-model'

export function getSchemaTypeByName(name: string, schema: Schema): NodeType | MarkType | null {
  return schema.nodes[name] || schema.marks[name] || null
}
