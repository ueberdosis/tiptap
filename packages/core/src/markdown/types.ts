// Shared markdown-related types for the MarkdownManager and extensions.
export type MarkdownToken = {
  type?: string
  raw?: string
  text?: string
  tokens?: MarkdownToken[]
  depth?: number
  items?: MarkdownToken[]
}

export type MarkdownNode = {
  type: string
  content?: MarkdownNode[]
  attrs?: Record<string, unknown>
  text?: string
}

export type MarkdownHelpers = {
  parseInline: (tokens: MarkdownToken[]) => MarkdownNode[]
  renderChildren: (node: MarkdownNode[] | MarkdownNode) => string
  text: (token: MarkdownToken) => MarkdownNode
}

/**
 * Full runtime helpers object provided by MarkdownManager to handlers.
 * This includes the small author-facing helpers plus internal helpers
 * that can be useful for advanced handlers.
 */
export type FullMarkdownHelpers = MarkdownHelpers & {
  parseChildren: (tokens: MarkdownToken[]) => MarkdownNode[]
  getExtension: (name: string) => any
  createNode: (type: string, attrs?: any, content?: MarkdownNode[]) => MarkdownNode
}

export default MarkdownHelpers

/**
 * Return shape for parser-level `parse` handlers.
 * - a single JSON-like node
 * - an array of JSON-like nodes
 * - or a `{ mark: string, content: JSONLike[] }` shape to apply a mark
 */
export type MarkdownParseResult = MarkdownNode | MarkdownNode[] | { mark: string; content: MarkdownNode[] }
