import { nodeEqualsType } from 'tiptap-utils'

export default function setTextAlignment(type, attrs = {}) {
  return (state, dispatch) => {
    const {
      doc,
      selection,
      schema,
      tr,
    } = state

    if (!selection || !doc) {
      return false
    }

    const alignment = attrs.align || null
    const { from, to } = selection
    const types = Object.entries(schema.nodes)
      .map(([, value]) => value)
      .filter(node => ['blockquote', 'heading', 'list_item', 'paragraph'].includes(node.name))
    const tasks = []
    let transformation = tr

    doc.nodesBetween(from, to, (node, pos) => {
      const align = node.attrs.align || null

      if (align !== alignment && nodeEqualsType({ node, types })) {
        tasks.push({
          node,
          pos,
        })
      }

      return true
    })

    if (!tasks.length) {
      return false
    }

    tasks.forEach(({ node, pos }) => {
      const { attrs } = node

      transformation = tr.setNodeMarkup(
        pos,
        node.type,
        { ...attrs, align: alignment || null },
        node.marks
      )
    })

    if (dispatch) {
      dispatch(transformation)
    }

    return true
  }
}
