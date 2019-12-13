import { setBlockType } from 'prosemirror-commands'
import { getNodeAttrs, nodeIsActive } from 'tiptap-utils'

export default function toggleBlockType(type, toggletype, attrs = {}) {
  return (state, dispatch, view) => {
    const isActive = nodeIsActive(state, type, attrs)
    const attributes = getNodeAttrs(state, type, attrs)

    if (isActive) {
      return setBlockType(toggletype, attributes)(state, dispatch, view)
    }

    return setBlockType(type, attributes)(state, dispatch, view)
  }
}
