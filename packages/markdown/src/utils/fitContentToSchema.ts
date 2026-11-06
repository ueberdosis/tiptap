import type { JSONContent } from '@tiptap/core'
import type { Schema } from '@tiptap/pm/model'

const isBlockNode = (node: JSONContent, schema: Schema): boolean => {
  const nodeType = node.type ? schema.nodes[node.type] : undefined

  return Boolean(nodeType && !nodeType.isInline)
}

const isInlineNode = (node: JSONContent, schema: Schema): boolean => {
  const nodeType = node.type ? schema.nodes[node.type] : undefined

  return Boolean(nodeType?.isInline)
}

/**
 * Splits a node with inline content around the block nodes inside it.
 *
 * @example
 *   // paragraph("a", blockImage, "b") → paragraph("a"), blockImage, paragraph("b")
 */
const splitAroundBlockNodes = (
  node: JSONContent,
  children: JSONContent[],
  schema: Schema,
): JSONContent[] => {
  if (!children.some(child => isBlockNode(child, schema))) {
    return [{ ...node, content: children }]
  }

  const result: JSONContent[] = []
  let segment: JSONContent[] = []

  const flushSegment = () => {
    if (segment.length > 0) {
      result.push({ ...node, content: segment })
      segment = []
    }
  }

  children.forEach(child => {
    if (!isBlockNode(child, schema)) {
      segment.push(child)
      return
    }

    flushSegment()
    result.push(child)
  })

  flushSegment()

  return result
}

/**
 * Wraps each run of inline nodes in a paragraph.
 *
 * @example
 *   // blockquote(inlineImage) → blockquote(paragraph(inlineImage))
 */
const wrapInlineNodes = (children: JSONContent[], schema: Schema): JSONContent[] => {
  if (!schema.nodes.paragraph || !children.some(child => isInlineNode(child, schema))) {
    return children
  }

  const result: JSONContent[] = []
  let inlineRun: JSONContent[] = []

  const flushInlineRun = () => {
    if (inlineRun.length > 0) {
      result.push({ type: 'paragraph', content: inlineRun })
      inlineRun = []
    }
  }

  children.forEach(child => {
    if (isInlineNode(child, schema)) {
      inlineRun.push(child)
      return
    }

    flushInlineRun()
    result.push(child)
  })

  flushInlineRun()

  return result
}

/**
 * Moves block and inline nodes to a place where the schema allows them.
 * Markdown can put an image anywhere, but the schema decides if an image is
 * inline or block, so parsed content can end up in the wrong place.
 *
 * Returns several nodes when the given node had to be split.
 *
 * @example
 *   // With a block image:
 *   fitContentToSchema(paragraph("a", image, "b"), schema)
 *   // → [paragraph("a"), image, paragraph("b")]
 *
 *   // With an inline image:
 *   fitContentToSchema(doc(image), schema)
 *   // → [doc(paragraph(image))]
 */
export function fitContentToSchema(node: JSONContent, schema: Schema): JSONContent[] {
  const nodeType = node.type ? schema.nodes[node.type] : undefined

  // Leave unknown nodes and nodes without children as they are.
  if (!nodeType || !node.content) {
    return [node]
  }

  const children = node.content.flatMap(child => fitContentToSchema(child, schema))

  if (nodeType.inlineContent) {
    return splitAroundBlockNodes(node, children, schema)
  }

  const content = wrapInlineNodes(children, schema)
  const firstType = content[0]?.type ? schema.nodes[content[0].type] : undefined
  const paragraphType = schema.nodes.paragraph

  // Some nodes must start with a paragraph, like a list item.
  // Add an empty one when a block image would come first.
  if (
    firstType &&
    paragraphType &&
    !nodeType.contentMatch.matchType(firstType) &&
    nodeType.contentMatch.matchType(paragraphType)
  ) {
    content.unshift({ type: 'paragraph' })
  }

  return [{ ...node, content }]
}
