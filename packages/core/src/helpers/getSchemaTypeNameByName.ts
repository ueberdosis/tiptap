import { Schema } from '@tiptap/pm/model'

/**
 * Get the type of a schema item by its name.
 * @param name The name of the schema item
 * @param schema The Prosemiror schema to search in
 * @returns The type of the schema item (`node` or `mark`), or null if it doesn't exist
 */
export function getSchemaTypeNameByName(name: string, schema: Schema): 'node' | 'mark' | null {
  if (schema.nodes[name]) {
    return 'node'
  }

  if (schema.marks[name]) {
    return 'mark'
  }

  return null
}
