import { EditorState } from 'prosemirror-state'
import nodeIsActive from './nodeIsActive'
import markIsActive from './markIsActive'
import getSchemaTypeNameByName from './getSchemaTypeNameByName'

export default function isActive(state: EditorState, name: string | null, attributes: { [key: string ]: any } = {}): boolean {
  if (name) {
    const schemaType = getSchemaTypeNameByName(name, state.schema)

    if (schemaType === 'node') {
      return nodeIsActive(state, state.schema.nodes[name], attributes)
    } if (schemaType === 'mark') {
      return markIsActive(state, state.schema.marks[name], attributes)
    }

    return false
  }

  return nodeIsActive(state, null, attributes) || markIsActive(state, null, attributes)
}
