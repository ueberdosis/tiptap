import { Node as ProseMirrorNode } from 'prosemirror-model'

import { JSONContent } from '../types'

interface DebugJSONContent extends JSONContent {
  from: number,
  to: number,
}

export function getDebugJSON(node: ProseMirrorNode, startOffset = 0): DebugJSONContent {
  const isTopNode = node.type === node.type.schema.topNodeType
  const increment = isTopNode ? 0 : 1
  const from = startOffset
  const to = from + node.nodeSize
  const marks = node.marks.map(mark => {
    const output: { type: string, attrs?: Record<string, any> } = {
      type: mark.type.name,
    }

    if (Object.keys(mark.attrs).length) {
      output.attrs = { ...mark.attrs }
    }

    return output
  })
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
