import type { DragHandleRule } from './rules.js'

/**
 * Edge detection presets for common use cases.
 */
export type EdgeDetectionPreset =
  | 'left' // Prefer parent when cursor near left edge (default)
  | 'right' // Prefer parent when cursor near right edge (RTL support)
  | 'both' // Prefer parent when cursor near left OR right edge
  | 'none' // Disable edge detection entirely

/**
 * Advanced edge detection configuration.
 * Most users should use presets instead.
 */
export interface EdgeDetectionConfig {
  /**
   * Which edges trigger parent preference.
   * @default ['left', 'top']
   */
  edges: Array<'left' | 'right' | 'top' | 'bottom'>

  /**
   * Distance in pixels from edge to trigger.
   * @default 12
   */
  threshold: number

  /**
   * How strongly to prefer parent (higher = stronger preference).
   * This is multiplied by depth, so deeper nodes are affected more.
   * @default 500
   */
  strength: number
}

/**
 * Configuration for nested drag handle behavior.
 */
export interface NestedOptions {
  /**
   * Additional rules to determine which nodes are draggable.
   * These run AFTER the default rules.
   *
   * @example
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
   */
  rules?: DragHandleRule[]

  /**
   * Set to `false` to disable default rules and use only your custom rules.
   * Default rules handle common cases like list items and inline content.
   *
   * @default true
   */
  defaultRules?: boolean

  /**
   * Restrict nested drag handles to specific container types.
   * If set, nested dragging only works inside these node types.
   *
   * @example
   * // Only enable nested dragging in lists and custom question blocks
   * allowedContainers: ['bulletList', 'orderedList', 'questionBlock']
   */
  allowedContainers?: string[]

  /**
   * Edge detection behavior. Controls when to prefer parent over nested node.
   *
   * Presets:
   * - `'left'` (default) - Prefer parent near left/top edges
   * - `'right'` - Prefer parent near right/top edges (for RTL)
   * - `'both'` - Prefer parent near any horizontal edge
   * - `'none'` - Disable edge detection
   *
   * Or pass a partial/full config object for fine-tuned control.
   * Partial configs are merged with defaults.
   *
   * @default 'left'
   *
   * @example
   * // Only override threshold, keep default edges and strength
   * edgeDetection: { threshold: 20 }
   */
  edgeDetection?: EdgeDetectionPreset | Partial<EdgeDetectionConfig>
}

/**
 * Normalized nested options with all properties resolved.
 */
export interface NormalizedNestedOptions {
  /** Whether nested drag handles are enabled */
  enabled: boolean

  /** Custom rules to apply */
  rules: DragHandleRule[]

  /** Whether to include default rules */
  defaultRules: boolean

  /** Allowed container node types (undefined means all) */
  allowedContainers: string[] | undefined

  /** Resolved edge detection configuration */
  edgeDetection: EdgeDetectionConfig
}
