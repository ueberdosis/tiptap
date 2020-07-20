export default function getNodeAttrs(state, type) {
  const { from, to } = state.selection
  let nodes = []

  state.doc.nodesBetween(from, to, node => {
    nodes = [...nodes, node]
  })

  const node = nodes
    .reverse()
    .find(nodeItem => nodeItem.type.name === type.name)

  if (node) {
    return node.attrs
  }

  return {}
}
