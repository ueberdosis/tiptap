import { Node as ProseMirrorNode } from 'prosemirror-model'
import { Predicate } from '../types'

type NodeWithPos = {
  node: ProseMirrorNode,
  pos: number,
}

export default function findChildren(node: ProseMirrorNode, predicate: Predicate): NodeWithPos[] {
  const nodesWithPos: NodeWithPos[] = []

  node.descendants((child, pos) => {
    if (predicate(child)) {
      nodesWithPos.push({
        node: child,
        pos,
      })
    }
  })

  return nodesWithPos
}
