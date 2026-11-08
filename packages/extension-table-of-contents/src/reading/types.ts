import type { Range } from '@tiptap/core'
import type { Node as PMNode } from '@tiptap/pm/model'

/**
 * One heading in the outline of a document.
 */
export type TableOfContentsHeading = {
  /** The heading's `data-toc-id`, or `null` if it has none yet. */
  id: string | null
  /** The heading level stored on the node. `1` for anchor types without a level. */
  level: number
  /** How far the heading is indented in the outline, starting at `1`. */
  depth: number
  /** The text of the heading. */
  textContent: string
  /** The position of the heading node in the document. */
  pos: number
}

export type ResolveTableOfContentsOptions = {
  /**
   * The node types that count as headings.
   * @default ['heading']
   */
  anchorTypes?: string[]
  /**
   * The parts of the document to read. A heading counts only if it lies fully inside one range.
   * @default the whole document
   */
  ranges?: Range[]
  /**
   * Leaves nodes out of the outline. Return `true` to skip a node and everything in it,
   * `'descend'` to skip only the node and still read its content, or `false` to read it.
   * @default every node is read
   * @example
   * // Skip headings the current reader may not see
   * ignore: (node, pos) => !canRead({ from: pos, to: pos + node.nodeSize })
   */
  ignore?: TableOfContentsIgnore
}

/**
 * Decides whether `resolveTableOfContents` skips a node.
 * @param node A node of the document.
 * @param pos The position of the node in the document.
 * @returns `true` to skip the node and its content, `'descend'` to skip only the node, `false` to read it.
 */
export type TableOfContentsIgnore = (node: PMNode, pos: number) => boolean | 'descend'

export type FilterTableOfContentsOptions = {
  /**
   * The heading levels to keep. Depths are counted again over the kept headings.
   * @default every level
   */
  levels?: number[]
  /**
   * The deepest depth to keep, counted from `1`.
   * @default no limit
   */
  maxDepth?: number
}
