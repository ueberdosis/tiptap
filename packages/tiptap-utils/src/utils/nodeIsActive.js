import {
  findParentNode,
  findSelectedNodeOfType,
} from 'prosemirror-utils'
import extensionIsActive from './extensionIsActive'

export default function nodeIsActive(state, type, attrs = {}) {
  if (type.name === 'alignment') {
    return extensionIsActive(state, type, attrs)
  }

  const predicate = node => node.type === type
  const node = findSelectedNodeOfType(type)(state.selection)
    || findParentNode(predicate)(state.selection)

  if (!Object.keys(attrs).length || !node) {
    return !!node
  }

  return node.node.hasMarkup(type, attrs)
}
