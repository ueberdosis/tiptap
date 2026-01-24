import type { Node, ResolvedPos } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'

/**
 * Context provided to each rule for evaluation.
 * Contains all information needed to make a decision.
 */
export interface RuleContext {
  /** The node being evaluated */
  node: Node

  /** Absolute position of the node in the document */
  pos: number

  /** Depth in the document tree (0 = doc root) */
  depth: number

  /** Parent node (null if this is the doc) */
  parent: Node | null

  /** This node's index among siblings (0-based) */
  index: number

  /** Convenience: true if index === 0 */
  isFirst: boolean

  /** Convenience: true if this is the last child */
  isLast: boolean

  /** The resolved position for advanced queries */
  $pos: ResolvedPos

  /** Editor view for DOM access if needed */
  view: EditorView
}

/**
 * A rule that determines whether a node should be a drag target.
 */
export interface DragHandleRule {
  /**
   * Unique identifier for debugging and rule management.
   */
  id: string

  /**
   * Evaluate the node and return a score deduction.
   *
   * The return value is subtracted from the node's score (which starts at 1000).
   * Higher deductions make the node less likely to be selected as the drag target.
   *
   * @returns A number representing the score deduction:
   *   - `0` - No deduction, node remains fully eligible
   *   - `1-999` - Partial deduction, node is less preferred but still eligible
   *   - `>= 1000` - Node is excluded from being a drag target
   *
   * @example
   * // Exclude first child in list items
   * evaluate: ({ parent, isFirst }) => {
   *   if (isFirst && parent?.type.name === 'listItem') {
   *     return 1000 // Exclude
   *   }
   *   return 0
   * }
   *
   * @example
   * // Prefer shallower nodes with partial deduction
   * evaluate: ({ depth }) => {
   *   // Deeper nodes get small deductions, making shallower nodes win ties
   *   return depth * 50
   * }
   *
   * @example
   * // Context-based partial deductions
   * evaluate: ({ node, parent }) => {
   *   if (parent?.type.name === 'tableCell') {
   *     // Inside table cells, slightly prefer the cell over its content
   *     return node.type.name === 'paragraph' ? 100 : 0
   *   }
   *   return 0
   * }
   */
  evaluate: (context: RuleContext) => number
}
