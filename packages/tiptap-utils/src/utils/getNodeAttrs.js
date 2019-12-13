import nodeEqualsType from './nodeEqualsType'

export default function getNodeAttrs(state, type, attrs) {
  let attributes = attrs
    ? { ...attrs }
    : null

  if ('align' in type.attrs) {
    const {
      schema: {
        nodes: { paragraph, heading },
      },
      selection: { from, to },
    } = state
    let align = null

    state.doc.nodesBetween(from, to, node => {
      if (align) {
        return false
      }

      if (!nodeEqualsType({ node, types: [paragraph, heading] })) {
        return true
      }

      align = node.attrs.align || null

      return false
    })

    if (align) {
      attributes = attrs
        ? { ...attrs, align }
        : null
    }
  }

  return attributes
}
