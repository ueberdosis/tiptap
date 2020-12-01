import { EditorState } from 'prosemirror-state'
import isNodeActive from './isNodeActive'
import isMarkActive from './isMarkActive'
import getSchemaTypeNameByName from './getSchemaTypeNameByName'
import { AnyObject } from '../types'

export default function isActive(state: EditorState, name: string | null, attributes: AnyObject = {}): boolean {
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
