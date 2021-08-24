import { Node as ProseMirrorNode } from 'prosemirror-model'
import { JSONContent } from '../types'

interface DebugJSONContent extends JSONContent {
  from: number,
  to: number,
}

export default function getDebugJSON(node: ProseMirrorNode, startOffset = 0): DebugJSONContent {
  const isTopNode = node.type === node.type.schema.topNodeType
  const increment = isTopNode ? 0 : 1
  const from = startOffset // + offset
  const to = from + node.nodeSize
  const marks = node.marks.map(mark => ({
    type: mark.type.name,
    attrs: { ...mark.attrs },
  }))
  const attrs = { ...node.attrs }
  const output: DebugJSONContent = {
    type: node.type.name,
    from,
    to,
  }

  if (Object.keys(attrs).length) {
    output.attrs = attrs
  }

  if (marks.length) {
    output.marks = marks
  }

  if (node.content.childCount) {
    output.content = []

    node.forEach((child, offset) => {
      output.content?.push(getDebugJSON(child, startOffset + offset + increment))
    })
  }

  if (node.text) {
    output.text = node.text
  }

  return output
}
