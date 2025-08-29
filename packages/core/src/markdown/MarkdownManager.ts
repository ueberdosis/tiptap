import { marked } from 'marked'

import { getExtensionField } from '../helpers/getExtensionField.js'
import type { AnyExtension, JSONContent } from '../types.js'
import type { MarkdownExtensionSpec, MarkdownRendererHelpers, RenderContext } from './types.js'
import { wrapInMarkdownBlock } from './utils.js'

export class MarkdownManager {
  private markedInstance: typeof marked
  private registry: Map<string, MarkdownExtensionSpec>
  private indentStyle: 'space' | 'tab'
  private indentSize: number

  /**
   * Create a MarkdownManager.
   * @param options.marked Optional marked instance to use (injected).
   * @param options.markedOptions Optional options to pass to marked.setOptions
   */
  constructor(options?: {
    marked?: typeof marked
    markedOptions?: Parameters<typeof marked.setOptions>[0]
    indentation?: { style?: 'space' | 'tab'; size?: number }
  }) {
    this.markedInstance = options?.marked ?? marked
    this.indentStyle = options?.indentation?.style ?? 'space'
    this.indentSize = options?.indentation?.size ?? 2

    if (options?.markedOptions && typeof this.markedInstance.setOptions === 'function') {
      this.markedInstance.setOptions(options.markedOptions)
    }

    this.registry = new Map()
  }

  /** Returns the underlying marked instance. */
  get instance(): typeof marked {
    return this.markedInstance
  }

  /** Returns the correct indentCharacter (space or tab) */
  get indentCharacter(): string {
    return this.indentStyle === 'space' ? ' ' : '\t'
  }

  /** Returns the correct indentString repeated X times */
  get indentString(): string {
    return this.indentCharacter.repeat(this.indentSize)
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
    const markdownCfg = getExtensionField(extension, 'markdown') ?? null

    const markdownName = (markdownCfg && markdownCfg.name) ?? name
    if (!markdownName) {
      return
    }

    const parseMarkdown = markdownCfg?.parse ?? undefined
    const renderMarkdown = markdownCfg?.render ?? undefined
    const isIndenting = markdownCfg?.isIndenting ?? undefined

    this.registry.set(markdownName, {
      markdownName,
      parseMarkdown,
      renderMarkdown,
      isIndenting,
    })
  }

  /** Get a registered handler for a token type. */
  private getHandlerForToken(type: string): MarkdownExtensionSpec | undefined {
    return this.registry.get(type)
  }

  /**
   * Serialize a ProseMirror-like JSON document (or node array) to a Markdown string
   * using registered renderers and fallback renderers.
   */
  serialize(docOrContent: JSONContent): string {
    if (!docOrContent) {
      return ''
    }

    // If an array of nodes was passed
    if (Array.isArray(docOrContent)) {
      return this.renderNodes(docOrContent, docOrContent)
    }

    // Single node
    return this.renderNodes(docOrContent, docOrContent)
  }

  /**
   * Convert an array of marked tokens into ProseMirror JSON nodes by using
   * registered extension handlers or a minimal fallback.
   */
  // TODO: implement child parsing
  parseChildren(): any[] {
    return []
  }

  renderNodeToMarkdown(node: JSONContent, parentNode?: JSONContent, index = 0, level = 0): string {
    if (!node.type) {
      return ''
    }

    // if node is a text node, we simply return it's text content
    if (node.type === 'text') {
      return node.text || ''
    }

    // TODO: check what the default case should be in case
    // of unknown node types (return the HTML? Try to return child content at least?)
    const handler = this.getHandlerForToken(node.type)
    if (!handler) {
      return ''
    }

    // TODO: We need to add marks rendering as well

    const helpers: MarkdownRendererHelpers = {
      renderChildren: (nodes, separator) => {
        const childLevel = handler.isIndenting ? level + 1 : level
        return this.renderNodes(nodes, node, separator || '', index, childLevel)
      },
      indent: content => {
        return this.indentString + content
      },
      wrapInBlock: wrapInMarkdownBlock,
    }

    const context: RenderContext = {
      index,
      level,
      parentType: parentNode?.type,
      meta: {},
    }

    return handler.renderMarkdown(node, helpers, context)
  }

  /**
   * Render a node or an array of nodes. Parent type controls how children
   * are joined (which determines newline insertion between children).
   */
  renderNodes(
    nodeOrNodes: JSONContent | JSONContent[],
    parentNode?: JSONContent,
    separator = '',
    index = 0,
    level = 0,
  ): string {
    // if we have just one node, call renderNodeToMarkdown directly
    if (!Array.isArray(nodeOrNodes)) {
      return this.renderNodeToMarkdown(nodeOrNodes, parentNode, index, level)
    }

    const output = nodeOrNodes.map((n, i) => this.renderNodeToMarkdown(n, parentNode, i, level))

    return output.join(separator)
  }
}

export default MarkdownManager
