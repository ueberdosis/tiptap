import { Node as ProseMirrorNode } from 'prosemirror-model'

/**
 * Returns a node tree with node positions.
 */
export default function getDebugJSON(node: ProseMirrorNode) {
  const debug = (startNode: ProseMirrorNode, startOffset = 0) => {
    const nodes: any[] = []

    startNode.forEach((n, offset) => {
      const from = startOffset + offset
      const to = from + n.nodeSize

      nodes.push({
        type: n.type.name,
        attrs: { ...n.attrs },
        from,
        to,
        marks: n.marks.map(mark => ({
          type: mark.type.name,
          attrs: { ...mark.attrs },
        })),
        content: debug(n, from + 1),
      })
    })

    return nodes
  }

  return debug(node)
}
