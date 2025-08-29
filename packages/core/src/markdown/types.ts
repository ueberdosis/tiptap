import type { Node } from '@tiptap/pm/model'

import type { JSONContent } from '../types'

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
  // When used during parsing these helpers return JSON-like node objects
  // (not ProseMirror Node instances). Use `any` to represent that shape.
  parseInline: (tokens: MarkdownToken[]) => any[]
  /**
   * Render children. The second argument may be a legacy separator string
   * or a RenderContext (preferred).
   */
  renderChildren: (node: Node[] | Node, ctxOrSeparator?: RenderContext | string) => string
  text: (token: MarkdownToken) => any
}

/**
 * Full runtime helpers object provided by MarkdownManager to handlers.
 * This includes the small author-facing helpers plus internal helpers
 * that can be useful for advanced handlers.
 */
export type FullMarkdownHelpers = MarkdownHelpers & {
  // parseChildren returns JSON-like nodes when invoked during parsing.
  parseChildren: (tokens: MarkdownToken[]) => any[]
  getExtension: (name: string) => any
  // createNode returns a JSON-like node during parsing; render-time helpers
  // may instead work with real ProseMirror Node instances.
  createNode: (type: string, attrs?: any, content?: any[]) => any
  /** Current render context when calling renderers; undefined during parse. */
  currentContext?: RenderContext
  /** Indent a multi-line string according to the provided RenderContext. */
  indent: (text: string, ctx?: RenderContext) => string
  /** Return the indent string for a given level (e.g. '  ' or '\t'). */
  getIndentString: (level?: number) => string
}

export default MarkdownHelpers

/**
 * Return shape for parser-level `parse` handlers.
 * - a single JSON-like node
 * - an array of JSON-like nodes
 * - or a `{ mark: string, content: JSONLike[] }` shape to apply a mark
 */
export type MarkdownParseResult = Node | Node[] | { mark: string; content: Node[] }

export type RenderContext = {
  index: number
  level: number
  meta?: Record<string, any>
  parentType?: string | null
}

/** Extension contract for markdown parsing/serialization. */
export interface MarkdownExtensionSpec {
  markdownName: string
  parseMarkdown: (token: any) => any
  renderMarkdown: (node: any, helpers: MarkdownRendererHelpers, ctx: RenderContext) => string
  isIndenting: boolean
}

export type MarkdownRendererHelpers = {
  renderChildren: (nodes: JSONContent | JSONContent[], separator?: string) => string
  wrapInBlock: (prefix: string, content: string) => string
  indent: (content: string) => string
}
