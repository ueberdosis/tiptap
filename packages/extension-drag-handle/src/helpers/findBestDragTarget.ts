import type { Node, ResolvedPos } from '@tiptap/pm/model'
import type { EditorView } from '@tiptap/pm/view'

import type { NormalizedNestedOptions } from '../types/options.js'
import type { DragHandleRule, RuleContext } from '../types/rules.js'
import { defaultRules } from './defaultRules.js'
import { calculateScore } from './scoring.js'

/**
 * Represents a drag target with its node, position, and DOM element.
 */
export interface DragTarget {
  /** The ProseMirror node */
  node: Node

  /** The absolute position in the document */
  pos: number

  /** The corresponding DOM element */
  dom: HTMLElement
}

/**
 * Checks if any ancestor at or above the given depth is in the allowed list.
 *
 * @param $pos - The resolved position
 * @param depth - The current depth being checked
 * @param allowedTypes - The list of allowed node type names
 * @returns True if any ancestor is in the allowed list
 */
function hasAncestorOfType($pos: ResolvedPos, depth: number, allowedTypes: string[]): boolean {
  const ancestorDepths = Array.from({ length: depth }, (_, i) => depth - 1 - i)

  return ancestorDepths.some(d => allowedTypes.includes($pos.node(d).type.name))
}

/**
 * Finds the best drag target at the given coordinates using the scoring system.
 *
 * @param view - The editor view
 * @param coords - The cursor coordinates
 * @param options - The normalized nested options
 * @returns The best drag target, or null if none found
 */
export function findBestDragTarget(
  view: EditorView,
  coords: { x: number; y: number },
  options: NormalizedNestedOptions,
): DragTarget | null {
  // Validate coordinates are finite numbers to prevent DOM errors
  if (!Number.isFinite(coords.x) || !Number.isFinite(coords.y)) {
    return null
  }

  // ProseMirror expects { left, top } format for coordinates
  const posInfo = view.posAtCoords({ left: coords.x, top: coords.y })

  if (!posInfo) {
    return null
  }

  const { doc } = view.state
  const $pos = doc.resolve(posInfo.pos)

  const rules: DragHandleRule[] = []

  if (options.defaultRules) {
    rules.push(...defaultRules)
  }

  rules.push(...options.rules)

  // Start from depth 1 to exclude the doc node (depth 0) which should never be draggable
  const depthLevels = Array.from({ length: $pos.depth }, (_, i) => $pos.depth - i)

  const candidates = depthLevels
    .map(depth => {
      const node = $pos.node(depth)
      const nodePos = $pos.before(depth)

      if (options.allowedContainers && depth > 0) {
        const inAllowedContainer = hasAncestorOfType($pos, depth, options.allowedContainers)

        if (!inAllowedContainer) {
          return null
        }
      }

      const parent = depth > 0 ? $pos.node(depth - 1) : null
      const index = depth > 0 ? $pos.index(depth - 1) : 0
      const siblingCount = parent ? parent.childCount : 1

      const context: RuleContext = {
        node,
        pos: nodePos,
        depth,
        parent,
        index,
        isFirst: index === 0,
        isLast: index === siblingCount - 1,
        $pos,
        view,
      }

      const score = calculateScore(context, rules, options.edgeDetection, coords)

      if (score < 0) {
        return null
      }

      const dom = view.nodeDOM(nodePos) as HTMLElement | null

      return { node, pos: nodePos, depth, score, dom }
    })
    .filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== null)

  if (candidates.length === 0) {
    return null
  }

  candidates.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }

    return b.depth - a.depth
  })

  const winner = candidates[0]

  if (!winner.dom) {
    return null
  }

  return {
    node: winner.node,
    pos: winner.pos,
    dom: winner.dom,
  }
}
