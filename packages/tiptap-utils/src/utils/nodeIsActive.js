import findSelectedNodeOfType from './findSelectedNodeOfType'
import findParentNode from './findParentNode'

export default function nodeIsActive(state, type, attrs = {}) {
  const predicate = node => node.type === type
  const node = findSelectedNodeOfType(type)(state.selection)
    || findParentNode(predicate)(state.selection)

  if (!Object.keys(attrs).length || !node) {
    return !!node
  }

  return node.node.hasMarkup(type, { ...node.node.attrs, ...attrs })
}
