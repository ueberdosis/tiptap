import findParentNodeClosestToPos from './findParentNodeClosestToPos'

export default function findParentNode(predicate) {
  return selection => findParentNodeClosestToPos(selection.$from, predicate)
}
