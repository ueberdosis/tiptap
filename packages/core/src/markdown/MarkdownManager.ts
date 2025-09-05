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
    if (!markdownName || !markdownCfg) {
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
    try {
      return this.registry.get(type)
    } catch {
      // ignore unknown registry call
    }
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
    // if node is a text node, we simply return it's text content
    if (node.type === 'text') {
      // apply marks on text nodes as well (if present)
      let inner = node.text || ''

      if (node.marks && Array.isArray(node.marks) && node.marks.length > 0) {
        const marks = node.marks as any[]
        for (let i = 0; i < marks.length; i += 1) {
          const mark = marks[i]
          const markHandler = this.getHandlerForToken(mark.type)
          if (!markHandler || !markHandler.renderMarkdown) {
            continue
          }

          // Create a synthetic mark node whose content is a single text node
          const markNode: JSONContent = {
            type: mark.type,
            attrs: mark.attrs ? mark.attrs : {},
            content: [{ type: 'text', text: inner }],
          }

          try {
            inner = markHandler.renderMarkdown(
              markNode,
              {
                renderChildren: (nodes: JSONContent | JSONContent[]) => {
                  if (!Array.isArray(nodes) && (nodes as any).content) {
                    return this.renderNodes((nodes as any).content as JSONContent[], markNode, '')
                  }

                  return this.renderNodes(nodes, markNode, '')
                },
                indent: content => this.indentString + content,
                wrapInBlock: wrapInMarkdownBlock,
              },
              { index: 0, level, parentType: node.type, meta: {} },
            )
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Markdown mark renderer failed for', mark.type, err)
            // keep inner as-is (unmarked)
          }
        }
      }

      return inner
    }

    if (!node.type || !this.registry.has(node.type)) {
      return ''
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

        if (!Array.isArray(nodes) && (nodes as any).content) {
          return this.renderNodes((nodes as any).content as JSONContent[], node, separator || '', index, childLevel)
        }

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

    // First render the node itself (this will render children recursively)
    const rendered = handler.renderMarkdown(node, helpers, context)

    return rendered
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
      if (!nodeOrNodes.type) {
        return ''
      }

      return this.renderNodeToMarkdown(nodeOrNodes, parentNode, index, level)
    }

    return nodeOrNodes
      .map((n, i) => {
        if (!n.type) {
          return ''
        }

        return this.renderNodeToMarkdown(n, parentNode, i, level)
      })
      .join(separator)
  }
}

export default MarkdownManager
