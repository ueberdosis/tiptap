import { wrapIn, lift } from 'prosemirror-commands'
import { getNodeAttrs, nodeIsActive } from 'tiptap-utils'

export default function (type) {
  return (state, dispatch, view) => {
    const isActive = nodeIsActive(state, type)

    if (isActive) {
      return lift(state, dispatch)
    }

    const attrs = getNodeAttrs(state, type)

    return wrapIn(type, attrs)(state, dispatch, view)
  }
}
