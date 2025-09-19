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
    // marks are handled at the array level in renderNodesWithMarkBoundaries
    if (node.type === 'text') {
      return node.text || ''
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

    return this.renderNodesWithMarkBoundaries(nodeOrNodes, parentNode, separator, level)
  }

  /**
   * Render an array of nodes while properly tracking mark boundaries.
   * This handles cases where marks span across multiple text nodes.
   */
  private renderNodesWithMarkBoundaries(
    nodes: JSONContent[],
    parentNode?: JSONContent,
    separator = '',
    level = 0,
  ): string {
    const result: string[] = []
    const activeMarks: Map<string, any> = new Map()

    nodes.forEach((node, i) => {
      // Lookahead to the next node to determine if marks need to be closed
      const nextNode = i < nodes.length - 1 ? nodes[i + 1] : null

      if (!node.type) {
        return
      }

      if (node.type === 'text') {
        let textContent = node.text || ''
        const currentMarks = new Map((node.marks || []).map(mark => [mark.type, mark]))

        // Find marks that need to be closed (active but not in current node)
        const marksToClose: string[] = []
        Array.from(activeMarks.keys()).forEach(markType => {
          if (!currentMarks.has(markType)) {
            marksToClose.push(markType)
          }
        })

        // Find marks that need to be opened (in current node but not active)
        const marksToOpen: Array<{ type: string; mark: any }> = []
        Array.from(currentMarks.entries()).forEach(([markType, mark]) => {
          if (!activeMarks.has(markType)) {
            marksToOpen.push({ type: markType, mark })
          }
        })

        // Close marks (in reverse order of how they were opened)
        marksToClose.reverse().forEach(markType => {
          const mark = activeMarks.get(markType)
          const closeMarkdown = this.getMarkClosing(markType, mark)
          if (closeMarkdown) {
            textContent += closeMarkdown
          }
          activeMarks.delete(markType)
        })

        // Open new marks (should be at the beginning)
        marksToOpen.forEach(({ type, mark }) => {
          const openMarkdown = this.getMarkOpening(type, mark)
          if (openMarkdown) {
            textContent = openMarkdown + textContent
          }
          activeMarks.set(type, mark)
        })

        // If this is the last text node or next node doesn't have marks, close remaining marks
        const isLastNode = !nextNode
        const nextNodeHasNoMarks =
          nextNode && nextNode.type === 'text' && (!nextNode.marks || nextNode.marks.length === 0)
        const nextNodeHasDifferentMarks =
          nextNode &&
          nextNode.type === 'text' &&
          nextNode.marks &&
          !this.markSetsEqual(currentMarks, new Map(nextNode.marks.map(mark => [mark.type, mark])))

        if (isLastNode || nextNodeHasNoMarks || nextNodeHasDifferentMarks) {
          // Close any marks that end here
          const marksToCloseAtEnd: string[] = []
          if (nextNode && nextNode.type === 'text' && nextNode.marks) {
            const nextMarks = new Map(nextNode.marks.map(mark => [mark.type, mark]))
            Array.from(activeMarks.keys()).forEach(markType => {
              if (!nextMarks.has(markType)) {
                marksToCloseAtEnd.push(markType)
              }
            })
          } else if (isLastNode || nextNodeHasNoMarks) {
            // Close all active marks
            marksToCloseAtEnd.push(...Array.from(activeMarks.keys()))
          }

          marksToCloseAtEnd.reverse().forEach(markType => {
            const mark = activeMarks.get(markType)
            const closeMarkdown = this.getMarkClosing(markType, mark)
            if (closeMarkdown) {
              textContent += closeMarkdown
            }
            activeMarks.delete(markType)
          })
        }

        result.push(textContent)
      } else {
        // For non-text nodes, close all active marks before rendering, then reopen after
        const marksToReopen = new Map(activeMarks)

        // Close all marks
        let beforeMarkdown = ''
        Array.from(activeMarks.keys())
          .reverse()
          .forEach(markType => {
            const mark = activeMarks.get(markType)
            const closeMarkdown = this.getMarkClosing(markType, mark)
            if (closeMarkdown) {
              beforeMarkdown = closeMarkdown + beforeMarkdown
            }
          })
        activeMarks.clear()

        // Render the node
        const nodeContent = this.renderNodeToMarkdown(node, parentNode, i, level)

        // Reopen marks after the node
        let afterMarkdown = ''
        Array.from(marksToReopen.entries()).forEach(([markType, mark]) => {
          const openMarkdown = this.getMarkOpening(markType, mark)
          if (openMarkdown) {
            afterMarkdown += openMarkdown
          }
          activeMarks.set(markType, mark)
        })

        result.push(beforeMarkdown + nodeContent + afterMarkdown)
      }
    })

    return result.join(separator)
  }

  /**
   * Get the opening markdown syntax for a mark type.
   */
  private getMarkOpening(markType: string, mark: any): string {
    const handler = this.getHandlerForToken(markType)
    if (!handler || !handler.renderMarkdown) {
      return ''
    }

    // Use a unique placeholder that's extremely unlikely to appear in real content
    const placeholder = '\uE000__TIPTAP_MARKDOWN_PLACEHOLDER__\uE001'

    // For most marks, we can extract the opening syntax by rendering a simple case
    const syntheticNode: JSONContent = {
      type: markType,
      attrs: mark.attrs || {},
      content: [{ type: 'text', text: placeholder }],
    }

    try {
      const rendered = handler.renderMarkdown(
        syntheticNode,
        {
          renderChildren: () => placeholder,
          indent: (content: string) => content,
          wrapInBlock: (prefix: string, content: string) => prefix + content,
        },
        { index: 0, level: 0, parentType: 'text', meta: {} },
      )

      // Extract the opening part (everything before placeholder)
      const placeholderIndex = rendered.indexOf(placeholder)
      return placeholderIndex >= 0 ? rendered.substring(0, placeholderIndex) : ''
    } catch (err) {
      console.error('Failed to get mark opening for', markType, err)
      return ''
    }
  }

  /**
   * Get the closing markdown syntax for a mark type.
   */
  private getMarkClosing(markType: string, mark: any): string {
    const handler = this.getHandlerForToken(markType)
    if (!handler || !handler.renderMarkdown) {
      return ''
    }

    // Use a unique placeholder that's extremely unlikely to appear in real content
    const placeholder = '\uE000__TIPTAP_MARKDOWN_PLACEHOLDER__\uE001'

    const syntheticNode: JSONContent = {
      type: markType,
      attrs: mark.attrs || {},
      content: [{ type: 'text', text: placeholder }],
    }

    try {
      const rendered = handler.renderMarkdown(
        syntheticNode,
        {
          renderChildren: () => placeholder,
          indent: (content: string) => content,
          wrapInBlock: (prefix: string, content: string) => prefix + content,
        },
        { index: 0, level: 0, parentType: 'text', meta: {} },
      )

      // Extract the closing part (everything after placeholder)
      const placeholderIndex = rendered.indexOf(placeholder)
      const placeholderEnd = placeholderIndex + placeholder.length
      return placeholderIndex >= 0 ? rendered.substring(placeholderEnd) : ''
    } catch (err) {
      console.error('Failed to get mark closing for', markType, err)
      return ''
    }
  }

  /**
   * Check if two mark sets are equal.
   */
  private markSetsEqual(marks1: Map<string, any>, marks2: Map<string, any>): boolean {
    if (marks1.size !== marks2.size) {
      return false
    }

    return Array.from(marks1.keys()).every(type => marks2.has(type))
  }
}

export default MarkdownManager
