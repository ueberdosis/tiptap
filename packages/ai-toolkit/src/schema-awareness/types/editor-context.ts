import type { SerializedSchema } from '../utils/serialize-schema.js'
import type { SerializedJsonItem } from './json-item.js'

/**
 * Result of {@link getEditorContext} containing information about the
 * editor's extensions that the Server AI Toolkit needs to work.
 */
export interface EditorContext {
  /**
   * The serialized ProseMirror schema
   */
  serializedSchema: SerializedSchema
  /**
   * The merged custom nodes with Zod schemas converted to JSON schemas
   */
  items: SerializedJsonItem[]
}
