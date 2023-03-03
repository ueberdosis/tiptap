import { getNodeType, RawCommands } from '@tiptap/core'

export const joinListItemForward: RawCommands['splitListItem'] = typeOrName => ({
  state,
}) => {
  const type = getNodeType(typeOrName, state.schema)

  console.log(type)

  return true
}
