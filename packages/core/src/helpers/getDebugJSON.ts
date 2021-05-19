import { Node as ProseMirrorNode } from 'prosemirror-model'
import { JSONContent } from '../types'

interface DebugJSONContent extends JSONContent {
  from: number,
  to: number,
}

/**
 * Returns a node tree with node positions.
 */
export default function getDebugJSON(node: ProseMirrorNode, startOffset = 0) {
  const nodes: DebugJSONContent[] = []

  node.forEach((n, offset) => {
    const from = startOffset + offset
    const to = from + n.nodeSize
    const marks = n.marks.map(mark => ({
      type: mark.type.name,
      attrs: { ...mark.attrs },
    }))
    const attrs = { ...n.attrs }
    const content = getDebugJSON(n, from + 1)
    const output: DebugJSONContent = {
      type: n.type.name,
      from,
      to,
    }

    if (Object.keys(attrs).length) {
      output.attrs = attrs
    }

    if (marks.length) {
      output.marks = marks
    }

    if (content.length) {
      output.content = content
    }

    if (n.text) {
      output.text = n.text
    }

    nodes.push(output)
  })

  return nodes
}
