import { NodeSelection } from 'prosemirror-state'

export default function isNodeSelection(selection) {
  return selection instanceof NodeSelection
}
