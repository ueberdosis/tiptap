import type { Node } from '@tiptap/pm/model'

// Shared markdown-related types for the MarkdownManager and extensions.
export type MarkdownToken = {
  type?: string
  raw?: string
  text?: string
  tokens?: MarkdownToken[]
  depth?: number
  items?: MarkdownToken[]
}

export type MarkdownHelpers = {
  parseInline: (tokens: MarkdownToken[]) => Node[]
  renderChildren: (node: Node[] | Node, separator?: string) => string
  text: (token: MarkdownToken) => Node
}

/**
 * Full runtime helpers object provided by MarkdownManager to handlers.
 * This includes the small author-facing helpers plus internal helpers
 * that can be useful for advanced handlers.
 */
export type FullMarkdownHelpers = MarkdownHelpers & {
  parseChildren: (tokens: MarkdownToken[]) => Node[]
  getExtension: (name: string) => any
  createNode: (type: string, attrs?: any, content?: Node[]) => Node
}

export default MarkdownHelpers

/**
 * Return shape for parser-level `parse` handlers.
 * - a single JSON-like node
 * - an array of JSON-like nodes
 * - or a `{ mark: string, content: JSONLike[] }` shape to apply a mark
 */
export type MarkdownParseResult = Node | Node[] | { mark: string; content: Node[] }
