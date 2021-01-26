export default function getTableNodeTypes(schema) {
  if (schema.cached.tableNodeTypes) {
    return schema.cached.tableNodeTypes
  }

  const roles = {}

  Object.keys(schema.nodes).forEach(type => {
    const nodeType = schema.nodes[type]

    if (nodeType.spec.tableRole) {
      roles[nodeType.spec.tableRole] = nodeType
    }
  })

  // eslint-disable-next-line
  schema.cached.tableNodeTypes = roles

  return roles
}
