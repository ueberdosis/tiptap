import { EditorState } from '@tiptap/pm/state'

import { getSchemaTypeNameByName } from './getSchemaTypeNameByName.js'
import { isMarkActive } from './isMarkActive.js'
import { isNodeActive } from './isNodeActive.js'

export function isActive(
  state: EditorState,
  name: string | null,
  attributes: Record<string, any> = {},
): boolean {
  if (!name) {
    return isNodeActive(state, null, attributes) || isMarkActive(state, null, attributes)
  }

  const schemaType = getSchemaTypeNameByName(name, state.schema)

  if (schemaType === 'node') {
    return isNodeActive(state, name, attributes)
  }

  if (schemaType === 'mark') {
    return isMarkActive(state, name, attributes)
  }

  return false
}
