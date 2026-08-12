import type { Node, ResolvedPos } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'

/**
 * Context provided to each rule evaluation function.
 *
 * Contains information about the node being evaluated and its position in the
 * ProseMirror document tree. This is the full context available for making
 * scoring decisions in custom `DragHandleRule` implementations.
 *
 * @example
 * // Typical usage in a custom rule
 * evaluate: ({ node, parent, depth, isFirst }) => {
 *   if (parent?.type.name === 'listItem' && isFirst) {
 *     return 1000 // exclude first child of list items
 *   }
 *   if (depth > 3) {
 *     return depth * 200 // deprioritize deep nesting
 *   }
 *   return 0
 * }
 */
export interface RuleContext {
  /** The ProseMirror node being evaluated as a potential drag target */
  node: Node

  /** Absolute position of the node in the document */
  pos: number

  /**
   * Depth in the document tree (0 = document root).
   * A paragraph inside a listItem inside a bulletList has depth 3.
   */
  depth: number

  /**
   * Parent node of the node being evaluated.
   * `null` if the node is the document root (depth 0).
   */
  parent: Node | null

  /** This node's index among its parent's children (0-based) */
  index: number

  /** Convenience: `true` when this node is the first child of its parent (index === 0) */
  isFirst: boolean

  /** Convenience: `true` when this node is the last child of its parent */
  isLast: boolean

  /**
   * The resolved position for advanced ProseMirror queries.
   * Allows access to ancestor nodes, child nodes, and document structure
   * beyond the current node.
   */
  $pos: ResolvedPos

  /**
   * The editor view for DOM access if needed in custom rules.
   * Can be used to access the editor DOM element, measure dimensions, etc.
   */
  view: EditorView
}

/**
 * A rule that determines whether a node should be a drag target.
 *
 * Each rule receives a `RuleContext` and returns a numeric deduction.
 * Multiple rules are evaluated in sequence; the total deduction is subtracted
 * from the node's base score (1000). If the score drops to 0 or below,
 * the node is excluded as a drag target.
 */
export interface DragHandleRule {
  /**
   * Unique identifier for debugging and rule management.
   * Choose a descriptive name that explains what the rule does.
   */
  id: string

  /**
   * Evaluate the node and return a score deduction.
   *
   * The return value is subtracted from the node's base score (1000).
   * Higher deductions make the node less likely to be selected.
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
   *   return depth * 50
   * }
   *
   * @example
   * // Context-based partial deductions
   * evaluate: ({ node, parent }) => {
   *   if (parent?.type.name === 'tableCell') {
   *     return node.type.name === 'paragraph' ? 100 : 0
   *   }
   *   return 0
   * }
   */
  evaluate: (context: RuleContext) => number
}
