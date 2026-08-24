import type { EdgeDetectionConfig, EdgeDetectionPreset } from '../types/options.js'

/**
 * Default edge detection configuration.
 */
const DEFAULT_EDGE_CONFIG: EdgeDetectionConfig = {
  edges: ['left', 'top'],
  threshold: 12,
  strength: 500,
}

/**
 * Normalizes edge detection presets or custom config into a full config object.
 * Partial configs are merged with defaults.
 *
 * @param input - The preset string or partial/full config
 * @returns A complete EdgeDetectionConfig
 */
export function normalizeEdgeDetection(
  input: EdgeDetectionPreset | Partial<EdgeDetectionConfig> | undefined,
): EdgeDetectionConfig {
  if (input === undefined || input === 'left') {
    return { ...DEFAULT_EDGE_CONFIG }
  }

  if (input === 'right') {
    return { edges: ['right', 'top'], threshold: 12, strength: 500 }
  }

  if (input === 'both') {
    return { edges: ['left', 'right', 'top'], threshold: 12, strength: 500 }
  }

  if (input === 'none') {
    return { edges: [], threshold: 0, strength: 0 }
  }

  // Merge partial config with defaults
  return { ...DEFAULT_EDGE_CONFIG, ...input }
}

/**
 * Determines if cursor is near specified edges of an element.
 *
 * @param coords - The cursor coordinates
 * @param element - The element to check against
 * @param config - The edge detection configuration
 * @returns True if the cursor is near any of the configured edges
 */
export function isNearEdge(
  coords: { x: number; y: number },
  element: HTMLElement,
  config: EdgeDetectionConfig,
): boolean {
  if (config.edges.length === 0) {
    return false
  }

  const rect = element.getBoundingClientRect()
  const { threshold, edges } = config

  return edges.some(edge => {
    if (edge === 'left') {
      return coords.x - rect.left < threshold
    }

    if (edge === 'right') {
      return rect.right - coords.x < threshold
    }

    if (edge === 'top') {
      return coords.y - rect.top < threshold
    }

    if (edge === 'bottom') {
      return rect.bottom - coords.y < threshold
    }

    return false
  })
}

/**
 * Calculates score deduction for edge proximity.
 * Deeper nodes get larger deductions when near edges,
 * making shallower (parent) nodes win.
 *
 * @param coords - The cursor coordinates
 * @param element - The element to check against (may be null)
 * @param config - The edge detection configuration
 * @param depth - The depth of the node in the document tree
 * @returns The score deduction to apply
 */
export function calculateEdgeDeduction(
  coords: { x: number; y: number },
  element: HTMLElement | null,
  config: EdgeDetectionConfig,
  depth: number,
): number {
  if (!element || config.edges.length === 0) {
    return 0
  }

  if (isNearEdge(coords, element, config)) {
    return config.strength * depth
  }

  return 0
}
