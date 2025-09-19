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
  [key: string]: any
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
 * Helpers specifically for parsing markdown tokens into Tiptap JSON.
 * These are provided to extension parse handlers.
 */
export type MarkdownParseHelpers = {
  /** Parse an array of inline tokens into text nodes with marks */
  parseInline: (tokens: MarkdownToken[]) => JSONContent[]
  /** Parse an array of block-level tokens */
  parseChildren: (tokens: MarkdownToken[]) => JSONContent[]
  /** Create a text node with optional marks */
  createTextNode: (text: string, marks?: Array<{ type: string; attrs?: any }>) => JSONContent
  /** Create any node type with attributes and content */
  createNode: (type: string, attrs?: any, content?: JSONContent[]) => JSONContent
  /** Apply a mark to content (used for inline marks like bold, italic) */
  applyMark: (
    markType: string,
    content: JSONContent[],
    attrs?: any,
  ) => { mark: string; content: JSONContent[]; attrs?: any }
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
export type MarkdownParseResult = JSONContent | JSONContent[] | { mark: string; content: JSONContent[]; attrs?: any }

export type RenderContext = {
  index: number
  level: number
  meta?: Record<string, any>
  parentType?: string | null
}

/** Extension contract for markdown parsing/serialization. */
export interface MarkdownExtensionSpec {
  /** Token name used for parsing (e.g., 'codespan', 'code', 'strong') */
  parseName?: string
  /** Node/mark name used for rendering (typically the extension name) */
  renderName?: string
  /** Legacy: if neither parseName nor renderName provided, use this */
  markdownName: string
  parseMarkdown?: (token: MarkdownToken, helpers: MarkdownParseHelpers) => MarkdownParseResult
  renderMarkdown?: (node: any, helpers: MarkdownRendererHelpers, ctx: RenderContext) => string
  isIndenting?: boolean
  /** Custom tokenizer for marked.js to handle non-standard markdown syntax */
  tokenizer?: MarkdownTokenizer
}

/** Custom tokenizer function for marked.js extensions */
export type MarkdownTokenizer = {
  /** Token name this tokenizer creates */
  name: string
  /** Priority level for tokenizer ordering (higher = earlier) */
  level?: 'block' | 'inline'
  /** Function that attempts to parse custom syntax from start of text */
  tokenize: (src: string, tokens: MarkdownToken[]) => MarkdownToken | undefined | void
}

export type MarkdownRendererHelpers = {
  renderChildren: (nodes: JSONContent | JSONContent[], separator?: string) => string
  wrapInBlock: (prefix: string, content: string) => string
  indent: (content: string) => string
}
