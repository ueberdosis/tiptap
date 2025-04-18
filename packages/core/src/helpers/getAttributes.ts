import type { MarkType, NodeType } from '@tiptap/pm/model'
import type { EditorState } from '@tiptap/pm/state'

import { getMarkAttributes } from './getMarkAttributes.js'
import { getNodeAttributes } from './getNodeAttributes.js'
import { getSchemaTypeNameByName } from './getSchemaTypeNameByName.js'

/**
 * Get node or mark attributes by type or name on the current editor state
 * @param state The current editor state
 * @param typeOrName The node or mark type or name
 * @returns The attributes of the node or mark or an empty object
 */
export function getAttributes(state: EditorState, typeOrName: string | NodeType | MarkType): Record<string, any> {
  const schemaType = getSchemaTypeNameByName(
    typeof typeOrName === 'string' ? typeOrName : typeOrName.name,
    state.schema,
  )

  if (schemaType === 'node') {
    return getNodeAttributes(state, typeOrName as NodeType)
  }

  if (schemaType === 'mark') {
    return getMarkAttributes(state, typeOrName as MarkType)
  }

  return {}
}
