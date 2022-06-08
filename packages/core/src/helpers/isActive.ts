import { EditorState } from 'prosemirror-state'

import { getSchemaTypeNameByName } from './getSchemaTypeNameByName'
import { isMarkActive } from './isMarkActive'
import { isNodeActive } from './isNodeActive'

export function isActive(state: EditorState, name: string | null, attributes: Record<string, any> = {}): boolean {
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
