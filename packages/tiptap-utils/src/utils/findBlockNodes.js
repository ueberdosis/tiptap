import findChildren from './findChildren'

export default function findBlockNodes(node, descend) {
  return findChildren(node, child => child.isBlock, descend)
}
