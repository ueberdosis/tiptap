import { marked } from 'marked'

import { getExtensionField } from '../helpers/getExtensionField.js'
import type { AnyExtension } from '../types.js'
import type { FullMarkdownHelpers } from './types.js'

/** Extension contract for markdown parsing/serialization. */
export interface MarkdownExtensionSpec {
  markdownName?: string
  parseMarkdown?: (token: any, helpers: FullMarkdownHelpers) => any
  renderMarkdown?: (node: any, helpers: FullMarkdownHelpers) => string
  priority?: number
}

export class MarkdownManager {
  private markedInstance: typeof marked
  private registry: Map<string, MarkdownExtensionSpec>

  /**
   * Create a MarkdownManager.
   * @param options.marked Optional marked instance to use (injected).
   * @param options.markedOptions Optional options to pass to marked.setOptions
   */
  constructor(options?: { marked?: typeof marked; markedOptions?: Parameters<typeof marked.setOptions>[0] }) {
    this.markedInstance = options?.marked ?? marked

    if (options?.markedOptions && typeof this.markedInstance.setOptions === 'function') {
      this.markedInstance.setOptions(options.markedOptions)
    }

    this.registry = new Map()
  }

  /** Returns the underlying marked instance. */
  get instance(): typeof marked {
    return this.markedInstance
  }

  /** Helper to quickly check whether a marked instance is available. */
  hasMarked(): boolean {
    return !!this.markedInstance
  }

  /**
   * Register a Tiptap extension (Node/Mark/Extension). This will read
   * `markdownName`, `parseMarkdown`, `renderMarkdown` and `priority` from the
   * extension config (using the same resolution used across the codebase).
   */
  registerExtension(extension: AnyExtension): void {
    const name = extension.name
    // Read the `markdown` object from the extension config. This allows
    // extensions to provide `markdown: { name?, parse?, render?, match? }`.
    const markdownCfg = getExtensionField<any>(extension, 'markdown' as any) ?? null

    const markdownName = (markdownCfg && markdownCfg.name) ?? name
    if (!markdownName) {
      return
    }

    const parseMarkdown = markdownCfg?.parse ?? undefined
    const renderMarkdown = markdownCfg?.render ?? undefined
    const priority = getExtensionField<number>(extension, 'priority' as any)

    this.registry.set(markdownName, {
      markdownName,
      parseMarkdown,
      renderMarkdown,
      priority,
    })
  }

  /** Get a registered handler for a token type. */
  private getHandlerForToken(type: string): MarkdownExtensionSpec | undefined {
    return this.registry.get(type)
  }

  /**
   * Parse a markdown string into Tiptap/ProseMirror JSON using registered
   * handlers. Returns an object shaped like a ProseMirror doc: { type: 'doc', content: [...] }
   */
  parse(markdown: string): any {
    if (!this.markedInstance || typeof this.markedInstance.lexer !== 'function') {
      throw new Error('[tiptap/markdown] marked is not available to parse markdown')
    }

    // Tokenize using marked's lexer
    const tokens = this.markedInstance.lexer(markdown)

    // Convert tokens to ProseMirror-like JSON nodes
    const content = this.parseChildren(tokens)

    return {
      type: 'doc',
      content,
    }
  }

  /**
   * Serialize a ProseMirror-like JSON document (or node array) to a Markdown string
   * using registered renderers and fallback renderers.
   */
  serialize(docOrContent: any): string {
    if (!docOrContent) {
      return ''
    }

    // If a full doc was passed
    if (docOrContent.type === 'doc' && Array.isArray(docOrContent.content)) {
      return this.renderChildren(docOrContent.content)
    }

    // If an array of nodes was passed
    if (Array.isArray(docOrContent)) {
      return this.renderChildren(docOrContent)
    }

    // Single node
    return this.renderChildren(docOrContent)
  }

  /**
   * Convert an array of marked tokens into ProseMirror JSON nodes by using
   * registered extension handlers or a minimal fallback.
   */
  parseChildren(tokens: any[]): any[] {
    const helpers: FullMarkdownHelpers = {
      parseChildren: (children: any[]) => this.parseChildren(children),
      renderChildren: (node: any) => this.renderChildren(node),
      getExtension: (name: string) => this.registry.get(name),

      // extras
      parseInline: (children: any[]) => this.parseChildren(children),
      createNode: (type: string, attrs?: any, content?: any[]) => ({ type, attrs, content }),
      text: (token: any) => ({ type: 'text', text: token.raw ?? token.text ?? '' }),
    }

    const result: any[] = []

    ;(tokens || []).forEach(token => {
      const handler = this.getHandlerForToken(token.type)

      let node: any = null
      if (handler && typeof handler.parseMarkdown === 'function') {
        // Handlers may accept (token) or (token, helpers). We always
        // pass helpers for convenience; older handlers will ignore it.
        node = handler.parseMarkdown(token, helpers)
      } else {
        // Minimal fallback mapping for common token types
        switch (token.type) {
          case 'text':
            node = helpers.text(token)
            break
          case 'paragraph':
            node = { type: 'paragraph', content: this.parseChildren(token.tokens || []) }
            break
          case 'heading':
            node = { type: 'heading', attrs: { level: token.depth }, content: this.parseChildren(token.tokens || []) }
            break
          case 'list':
          case 'list_item':
            // Lists are complex; expose items as children for now
            node = { type: token.type, attrs: token, content: this.parseChildren(token.tokens || token.items || []) }
            break
          default:
            // Unknown token: try to treat as plain text
            node = { type: 'text', text: token.raw ?? token.text ?? '' }
        }
      }

      if (Array.isArray(node)) {
        result.push(...node)
      } else if (node) {
        result.push(node)
      }
    })

    return result
  }

  /**
   * Render a ProseMirror node or node content back to Markdown using
   * registered renderers or minimal defaults.
   */
  renderChildren(node: any): string {
    const helpers: FullMarkdownHelpers = {
      parseChildren: (children: any[]) => this.parseChildren(children),
      renderChildren: (n: any) => this.renderChildren(n),
      getExtension: (name: string) => this.registry.get(name),

      // extras
      parseInline: (children: any[]) => this.parseChildren(children),
      createNode: (type: string, attrs?: any, content?: any[]) => ({ type, attrs, content }),
      text: (token: any) => ({ type: 'text', text: token.raw ?? token.text ?? '' }),
    }

    // If node is an array of nodes, render each
    if (Array.isArray(node)) {
      return node.map(n => this.renderChildren(n)).join('')
    }

    const handler = node && node.type && this.getHandlerForToken(node.type)
    if (handler && typeof handler.renderMarkdown === 'function') {
      return handler.renderMarkdown(node, helpers)
    }

    // Minimal fallback renderers
    if (!node) {
      return ''
    }

    switch (node.type) {
      case 'text': {
        return node.text || ''
      }
      case 'paragraph': {
        return `${this.renderChildren(node.content || [])}\n\n`
      }
      case 'heading': {
        return `${'#'.repeat((node.attrs && node.attrs.level) || 1)} ${this.renderChildren(node.content || [])}\n\n`
      }
      default: {
        // Unknown node: if it has text, return it
        if (node.text) {
          return node.text
        }
        return ''
      }
    }
  }
}

export default MarkdownManager
