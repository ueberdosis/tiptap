import { setBlockType } from 'prosemirror-commands'
import { nodeIsActive, nodeEqualsType } from 'tiptap-utils'

export default function toggleBlockType(type, toggletype, attrs = {}) {
  return (state, dispatch, view) => {
    const isActive = nodeIsActive(state, type, attrs)
    let attributes = !isActive
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
        attributes = !isActive
          ? { ...attrs, align }
          : { align }
      }
    }

    if (isActive) {
      return setBlockType(toggletype, attributes)(state, dispatch, view)
    }

    return setBlockType(type, attributes)(state, dispatch, view)
  }
}
