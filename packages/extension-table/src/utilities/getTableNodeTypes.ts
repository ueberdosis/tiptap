import { Schema } from 'prosemirror-model'

export function getTableNodeTypes(schema: Schema) {
  if (schema.cached.tableNodeTypes) {
    return schema.cached.tableNodeTypes
  }

  const roles = {}

  Object.keys(schema.nodes).forEach(type => {
    const nodeType = schema.nodes[type]

    if (nodeType.spec.tableRole) {
      // @ts-ignore
      roles[nodeType.spec.tableRole] = nodeType
    }
  })

  schema.cached.tableNodeTypes = roles

  return roles
}
