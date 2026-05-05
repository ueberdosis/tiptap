import type { DragHandleRule } from './rules.js'

/**
 * Edge detection presets for common use cases.
 *
 * Edge detection helps you grab parent containers (lists, blockquotes, etc.)
 * by moving the cursor near the edge of a nested element. When the cursor is
 * within the `threshold` zone of a configured edge, the scoring system deducts
 * `strength * depth` from deeper nodes, making the outer container the easier
 * target.
 *
 * In short: cursor near edge prefers parent; cursor centered prefers child.
 *
 * @example
 * // Left/top edges, natural for LTR layouts (default)
 * DragHandle.configure({
 *   nested: {
 *     edgeDetection: 'left',
 *   },
 * })
 *
 * @example
 * // Right/top edges, for RTL layouts
 * DragHandle.configure({
 *   nested: {
 *     edgeDetection: 'right',
 *   },
 * })
 *
 * @example
 * // No edge detection, cursor position does not affect scoring
 * DragHandle.configure({
 *   nested: {
 *     edgeDetection: 'none',
 *   },
 * })
 */
export type EdgeDetectionPreset =
  | 'left' // Prefer parent when cursor near left or top edge (LTR default)
  | 'right' // Prefer parent when cursor near right or top edge (RTL support)
  | 'both' // Prefer parent when cursor near any horizontal edge or top edge
  | 'none' // Disable edge detection entirely, cursor position does not affect scoring

/**
 * Advanced edge detection configuration for fine-grained control.
 *
 * Use this interface when the preset strings (\`'left'\`, \`'right'\`, etc.) aren't
 * enough and you need to customize **which edges**, **how wide the zone is**,
 * or **how aggressive** the parent preference should be.
 *
 * Most users should use \`EdgeDetectionPreset\` strings instead of this interface.
 * Only reach for this when you need precise control.
 *
 * @example
 * // Wider edge zone, gentler deduction, top/bottom edges only
 * DragHandle.configure({
 *   nested: {
 *     edgeDetection: {
 *       edges: ['top', 'bottom'],
 *       threshold: 24,
 *       strength: 300,
 *     },
 *   },
 * })
 *
 * @example
 * // Aggressive left-edge only: narrow zone, strong deduction
 * DragHandle.configure({
 *   nested: {
 *     edgeDetection: {
 *       edges: ['left'],
 *       threshold: 8,
 *       strength: 800,
 *     },
 *   },
 * })
 */
export interface EdgeDetectionConfig {
  /**
   * Which edges trigger parent preference.
   * - `'left'`: Cursor within threshold pixels of the element's left edge
   * - `'right'`: Cursor within threshold pixels of the element's right edge
   * - `'top'`: Cursor within threshold pixels of the element's top edge
   * - `'bottom'`: Cursor within threshold pixels of the element's bottom edge
   *
   * @default ['left', 'top']
   */
  edges: Array<'left' | 'right' | 'top' | 'bottom'>

  /**
   * Distance in pixels from the element edge that triggers the deduction.
   *
   * Think of this as the size of an invisible "edge zone" around the element.
   * When the cursor is inside this zone, `strength * depth` is deducted from
   * deeper nodes, making parent containers easier to grab.
   *
   * - **Higher value** (e.g., 24): The zone is wider, edge detection triggers
   *   even when the cursor is relatively far from the element's edge. Parent
   *   selection feels more "eager."
   * - **Lower value** (e.g., 6): The zone is narrower, the cursor must be
   *   very close to the edge before parent preference kicks in. You need to be
   *   more deliberate to grab a parent container.
   *
   * @example
   * // threshold: 12 means the cursor must be within 12px of the edge
   * // threshold: 24 doubles the trigger zone
   *
   * @default 12
   */
  threshold: number

  /**
   * How strongly to prefer parent nodes near edges (higher = stronger preference).
   *
   * The deduction formula is: `strength * depth`. This means the penalty grows
   * linearly with nesting depth, making deeply nested children less attractive
   * targets when you're near an edge, exactly what you want when trying to
   * grab the outer list rather than the inner paragraph.
   *
   * **Visual guide, default strength (500):**
   * ```
   * Depth | Deduction | Eligible?
   * ──────┼───────────┼──────────
   *   1   |    500    │ Yes, still a valid target
   *   2   |   1000    │ No, penalty matches base score
   *   3   |   1500    │ No, penalty exceeds base score
   *   4   |   2000    │ No, deeply buried
   * ```
   *
   * **Lower strength (200):**
   * ```
   * Depth | Deduction | Eligible?
   * ──────┼───────────┼──────────
   *   1   |    200    │ Yes
   *   2   |    400    │ Yes
   *   3   |    600    │ Yes
   *   4   |    800    │ Yes (but parent still preferred)
   *   5   |   1000    │ No, excluded at threshold
   * ```
   * Good when you want edge detection to nudge toward parents without
   * excluding typical nesting depths.
   *
   * **Higher strength (1000):**
   * ```
   * Depth | Deduction | Eligible?
   * ──────┼───────────┼──────────
   *   1   |   1000    │ No, excluded at threshold
   * ```
   * Every non-doc candidate near the edge is excluded from being a drag
   * target. Use when you want edge detection to completely disable nested
   * dragging near the edges and force root-level handles.
   *
   * @default 500
   */
  strength: number
}

/**
 * Configuration for nested drag handle behavior.
 *
 * When enabled, the drag handle can target nodes at any depth in the document
 * tree (not just top-level blocks). A rule-based scoring system evaluates all
 * ancestor nodes at the cursor position and selects the best drag target.
 *
 * **How the scoring works:**
 * 1. Each ancestor node at the cursor position starts with a base score of 1000
 * 2. Default rules are applied first (subtracting deductions for lists, tables, etc.)
 * 3. Your custom rules are applied next (for app-specific logic)
 * 4. Edge detection adds a final deduction (`strength * depth`) when near element edges
 * 5. The highest-scoring node wins; ties are broken by depth (deeper nodes win)
 * 6. Any node with a score of 0 or below is excluded as a drag target
 *
 * @example
 * // Simple enable with sensible defaults
 * DragHandle.configure({
 *   nested: true,
 * })
 *
 * @example
 * // Full custom configuration
 * DragHandle.configure({
 *   nested: {
 *     defaultRules: true,
 *     allowedContainers: ['bulletList', 'orderedList', 'blockquote'],
 *     edgeDetection: 'left',
 *     rules: [
 *       {
 *         id: 'myCustomRule',
 *         evaluate: ({ node }) =>
 *           node.type.name === 'myCustomBlock' ? 1000 : 0,
 *       },
 *     ],
 *   },
 * })
 */
export interface NestedOptions {
  /**
   * Custom rules that determine which nodes are draggable.
   *
   * Rules are evaluated AFTER the default rules. Each rule receives a
   * `RuleContext` and returns a score deduction:
   * - `0`: No effect, node remains fully eligible
   * - `1-999`: Partial deduction, node is less preferred but still eligible
   * - `>= 1000`: Node is **excluded** from being a drag target
   *
   * Common use cases for custom rules:
   * - Exclude specific node types from being draggable
   * - Deprioritize certain nodes with partial deductions
   * - Scope dragging to specific document structures
   *
   * @example
   * // Exclude code blocks from being draggable
   * rules: [
   *   {
   *     id: 'excludeCodeBlocks',
   *     evaluate: ({ node }) =>
   *       node.type.name === 'codeBlock' ? 1000 : 0,
   *   },
   * ]
   *
   * @example
   * // Inside a custom "question" block, only allow dragging "alternative" children
   * rules: [
   *   {
   *     id: 'onlyAlternatives',
   *     evaluate: ({ node, parent }) => {
   *       if (parent?.type.name === 'question') {
   *         return node.type.name === 'alternative' ? 0 : 1000
   *       }
   *       return 0
   *     },
   *   },
   * ]
   *
   * @example
   * // Deprioritize deeper nodes with partial deduction
   * rules: [
   *   {
   *     id: 'preferShallow',
   *     evaluate: ({ depth }) => depth * 100,
   *   },
   * ]
   */
  rules?: DragHandleRule[]

  /**
   * Whether to include the built-in default rules before your custom rules.
   *
   * The default rules handle common editor patterns:
   * - \`listItemFirstChild\` -- Excludes the first child of listItem/taskItem
   *   (the content paragraph), so the list item itself is the drag target
   * - \`listWrapperDeprioritize\` -- Excludes bulletList/orderedList wrappers,
   *   so individual list items are the default drag target
   * - \`tableStructure\` -- Excludes tableRow, tableCell, tableHeader from dragging
   *   (table extensions handle their own drag behavior)
   * - \`inlineContent\` -- Excludes inline nodes and text from being drag targets
   *
   * Set to `false` to disable all default rules and use only your custom `rules`.
   * This is useful when the default behavior conflicts with your custom setup.
   *
   * @default true
   *
   * @example
   * // Use only your own rule, no defaults
   * nested: {
   *   defaultRules: false,
   *   rules: [{
   *     id: 'onlyParagraphs',
   *     evaluate: ({ node }) =>
   *       node.type.name === 'paragraph' ? 0 : 1000,
   *   }],
   * }
   */
  defaultRules?: boolean

  /**
   * Restrict nested drag handles to specific container node types.
   *
   * When set, nested dragging only activates when the cursor is inside one of
   * the specified node types (at any ancestor level). When the cursor is
   * outside these containers, the drag handle hides entirely for nested
   * content positioned inside those regions.
   *
   * This is useful for scoping nested drag handles to specific editor regions
   * (e.g., lists and blockquotes) while keeping simpler blocks (headings,
   * paragraphs) working with only top-level handles.
   *
   * @example
   * // Only enable nested dragging inside lists
   * allowedContainers: ['bulletList', 'orderedList']
   *
   * @example
   * // Enable nested dragging inside lists and blockquotes
   * allowedContainers: ['bulletList', 'orderedList', 'blockquote']
   */
  allowedContainers?: string[]

  /**
   * Controls when the drag handle prefers a parent node over a deeply nested
   * child node, based on cursor proximity to element edges.
   *
   * When the cursor is near a configured edge of a nested element, the scoring
   * system deducts \`strength * depth\` from deeper nodes, making the parent
   * container (like an entire list) easier to grab.
   *
   * **Presets (quick and simple):**
   * - `'left'` (default): Cursor near left or top edge → prefer parent (LTR)
   * - `'right'`: Cursor near right or top edge → prefer parent (RTL)
   * - `'both'`: Cursor near left, right, or top edge → prefer parent
   * - \`'none'\`: Disabled, cursor position does not affect scoring at all
   *
   * **Fine-tuned object (full control):**
   * Pass a partial `EdgeDetectionConfig` to override only what you need:
   * - `edges`: Which element edges trigger parent preference (default: `['left', 'top']`)
   * - `threshold`: Width of the edge zone in pixels (default: `12`). Higher = easier to trigger.
   * - `strength`: Deduction multiplier per depth level (default: `500`). Higher = stronger parent preference.
   *
   * The effective deduction when near an edge is `strength * depth`, so deeper
   * nesting always gets penalized more, you naturally grab the outer wrapper.
   *
   * @default 'left'
   *
   * @example
   * // Just widen the trigger zone to 24px
   * edgeDetection: { threshold: 24 }
   *
   * @example
   * // Top/bottom edges only, very aggressive parent preference
   * edgeDetection: {
   *   edges: ['top', 'bottom'],
   *   threshold: 30,
   *   strength: 1000,
   * }
   *
   * @example
   * // Gentle edge detection, nudges toward parents without blocking typical depths
   * edgeDetection: {
   *   threshold: 6,
   *   strength: 200,
   * }
   */
  edgeDetection?: EdgeDetectionPreset | Partial<EdgeDetectionConfig>
}

/**
 * Fully resolved nested drag handle options after normalization.
 * Produced by `normalizeNestedOptions()` from user-provided `NestedOptions`
 * or a boolean flag. This is the internal representation consumed by the plugin.
 */
export interface NormalizedNestedOptions {
  /** Whether nested drag handles are enabled */
  enabled: boolean

  /** Custom rules to apply (combined with default rules if `defaultRules` is true) */
  rules: DragHandleRule[]

  /** Whether the built-in default rules are included alongside custom rules */
  defaultRules: boolean

  /** Allowed container node types, or `undefined` to allow all containers */
  allowedContainers: string[] | undefined

  /** Fully resolved edge detection configuration with all defaults applied */
  edgeDetection: EdgeDetectionConfig
}
