import { findParentNode, findSelectedNodeOfType } from 'prosemirror-utils'
import { EditorState } from 'prosemirror-state'
import { Node, NodeType } from 'prosemirror-model'

export default function nodeIsActive(state: EditorState, type: NodeType, attrs = {}) {
  const predicate = (node: Node) => node.type === type
  const node = findSelectedNodeOfType(type)(state.selection)
    || findParentNode(predicate)(state.selection)

  if (!Object.keys(attrs).length || !node) {
    return !!node
  }

  return node.node.hasMarkup(type, { ...node.node.attrs, ...attrs })
}
