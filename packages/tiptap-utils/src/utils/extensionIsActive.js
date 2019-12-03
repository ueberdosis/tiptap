import nodeEqualsType from './nodeEqualsType'

export default function extensionIsActive(state, type, attrs = {}) {
  const {
    schema,
    selection: { from, to },
    doc,
  } = state
  const { align = null } = attrs
  let keepLooking = true
  let active = false

  const types = Object
    .entries(schema.nodes)
    .map(([, value]) => value)
    .filter(node => ['blockquote', 'heading', 'paragraph', 'list_item'].includes(node.name))

  doc.nodesBetween(from, to, node => {
    if (keepLooking
      && nodeEqualsType({ node, types })
      && (node.attrs.align === align)
    ) {
      keepLooking = false
      active = true
    }

    return keepLooking
  })

  return active
}
