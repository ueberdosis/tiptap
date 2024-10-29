import { MarkType, NodeType } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'

import { getMarkAttributes } from './getMarkAttributes.js'
import { getNodeAttributes } from './getNodeAttributes.js'
import { getSchemaTypeNameByName } from './getSchemaTypeNameByName.js'

/**
 * Get node or mark attributes by type or name on the current editor state
 * @param state The current editor state
 * @param typeOrName The node or mark type or name
 * @param addNodenameAttribute Whether to add the `data-tiptap-node` attribute
 * @returns The attributes of the node or mark or an empty object
 */
export function getAttributes(
  state: EditorState,
  typeOrName: string | NodeType | MarkType,
  addNodenameAttribute = false,
): Record<string, any> {
  const schemaType = getSchemaTypeNameByName(
    typeof typeOrName === 'string' ? typeOrName : typeOrName.name,
    state.schema,
  )

  let attributes: Record<string, any> = {}

  if (schemaType === 'node') {
    attributes = getNodeAttributes(state, typeOrName as NodeType)
  } else if (schemaType === 'mark') {
    attributes = getMarkAttributes(state, typeOrName as MarkType)
  }

  if (addNodenameAttribute) {
    attributes['data-tiptap-node'] = typeof typeOrName === 'string' ? typeOrName : typeOrName.name
  }

  return attributes
}
