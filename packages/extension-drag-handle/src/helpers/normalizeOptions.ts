import type { NestedOptions, NormalizedNestedOptions } from '../types/options.js'
import { normalizeEdgeDetection } from './edgeDetection.js'

/**
 * Normalizes the nested options input into a complete configuration object.
 *
 * @param input - The nested option (boolean, object, or undefined)
 * @returns A fully normalized options object
 *
 * @example
 * // Simple enable
 * normalizeNestedOptions(true)
 * // Returns: { enabled: true, rules: [], defaultRules: true, ... }
 *
 * @example
 * // Custom config
 * normalizeNestedOptions({ rules: [myRule], edgeDetection: 'none' })
 * // Returns: { enabled: true, rules: [myRule], edgeDetection: { edges: [], ... } }
 */
export function normalizeNestedOptions(input: boolean | NestedOptions | undefined): NormalizedNestedOptions {
  if (input === false || input === undefined) {
    return {
      enabled: false,
      rules: [],
      defaultRules: true,
      allowedContainers: undefined,
      edgeDetection: normalizeEdgeDetection('none'),
    }
  }

  if (input === true) {
    return {
      enabled: true,
      rules: [],
      defaultRules: true,
      allowedContainers: undefined,
      edgeDetection: normalizeEdgeDetection('left'),
    }
  }

  return {
    enabled: true,
    rules: input.rules ?? [],
    defaultRules: input.defaultRules ?? true,
    allowedContainers: input.allowedContainers,
    edgeDetection: normalizeEdgeDetection(input.edgeDetection),
  }
}
