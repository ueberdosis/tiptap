import type { EdgeDetectionConfig } from '../types/options.js'
import type { DragHandleRule, RuleContext } from '../types/rules.js'
import { calculateEdgeDeduction } from './edgeDetection.js'

/**
 * Base score for all nodes. Rules deduct from this score.
 * A node with score <= 0 is excluded from being a drag target.
 */
export const BASE_SCORE = 1000

/**
 * Calculates the drag target score for a node.
 * Higher score = more likely to be selected.
 *
 * @param context - The rule context containing node information
 * @param rules - The rules to apply
 * @param edgeConfig - The edge detection configuration
 * @param coords - The cursor coordinates
 * @returns The calculated score, or -1 if the node is excluded
 */
export function calculateScore(
  context: RuleContext,
  rules: DragHandleRule[],
  edgeConfig: EdgeDetectionConfig,
  coords: { x: number; y: number },
): number {
  let score = BASE_SCORE
  let excluded = false

  rules.every(rule => {
    const deduction = rule.evaluate(context)

    score -= deduction

    if (score <= 0) {
      excluded = true
      return false
    }

    return true
  })

  if (excluded) {
    return -1
  }

  const dom = context.view.nodeDOM(context.pos) as HTMLElement | null

  score -= calculateEdgeDeduction(coords, dom, edgeConfig, context.depth)

  if (score <= 0) {
    return -1
  }

  return score
}
