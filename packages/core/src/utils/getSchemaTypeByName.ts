import { Schema } from 'prosemirror-model'

export default function getSchemaTypeByName(name: string, schema: Schema) {
  if (schema.nodes[name]) {
    return schema.nodes[name]
  }

  if (schema.marks[name]) {
    return schema.marks[name]
  }

  return null
}
