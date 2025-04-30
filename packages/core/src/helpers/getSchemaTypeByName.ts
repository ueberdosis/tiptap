import type { MarkType, NodeType, Schema } from '@tiptap/pm/model'

/**
 * Tries to get a node or mark type by its name.
 * @param name The name of the node or mark type
 * @param schema The Prosemiror schema to search in
 * @returns The node or mark type, or null if it doesn't exist
 */
export function getSchemaTypeByName(name: string, schema: Schema): NodeType | MarkType | null {
  return schema.nodes[name] || schema.marks[name] || null
}
