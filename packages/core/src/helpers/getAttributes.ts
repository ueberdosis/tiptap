import { MarkType, NodeType } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import { getSchemaTypeNameByName } from './getSchemaTypeNameByName'
import { getNodeAttributes } from './getNodeAttributes'
import { getMarkAttributes } from './getMarkAttributes'

export function getAttributes(
  state: EditorState,
  typeOrName: string | NodeType | MarkType,
): Record<string, any> {
  const schemaType = getSchemaTypeNameByName(
    typeof typeOrName === 'string'
      ? typeOrName
      : typeOrName.name,
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
