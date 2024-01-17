import { MarkType, NodeType, Schema } from '@tiptap/pm/model'

export function getSchemaTypeByName(name: string, schema: Schema): NodeType | MarkType | null {
  return schema.nodes[name] || schema.marks[name] || null
}
