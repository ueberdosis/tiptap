import { wrapIn, lift } from 'prosemirror-commands'
import { nodeIsActive } from 'tiptap-utils'

export default function (type) {
  return (state, dispatch, view) => {
    const isActive = nodeIsActive(state, type)

    if (isActive) {
      return lift(state, dispatch)
    }

    return wrapIn(type)(state, dispatch, view)
  }
}
