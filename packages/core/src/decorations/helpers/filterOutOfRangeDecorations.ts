import type { Decoration } from '../Decoration.js'
import { rangeOwnsPosition } from './rangeOwnsPosition.js'

export interface FilterOutOfRangeDecorationsOptions {
  decorations: Decoration[]
  from: number
  to: number
  /** `doc.content.size` of the document the range was computed against. */
  docSize: number
  /** The extension that created the decorations, used in the warning. */
  extensionName: string
  /** Extensions already warned about, so a buggy one warns once per editor. */
  warnedExtensions: Set<string>
}

/**
 * Filter decorations the block range `[from, to)` does not own.
 * Must match the stale sweep in `DecorationManager.rebuildRanges`.
 *
 * @param options The decorations, the range, and the warning bookkeeping.
 * @returns The filtered decorations.
 */
export function filterOutOfRangeDecorations({
  decorations,
  from,
  to,
  docSize,
  extensionName,
  warnedExtensions,
}: FilterOutOfRangeDecorationsOptions): Decoration[] {
  return decorations.filter(decoration => {
    if (rangeOwnsPosition({ position: decoration.anchor, from, to, docSize })) {
      return true
    }

    // The next block owns `to` and rebuilds it there, so this is a normal
    // overlap from scanning the boundary, not an authoring mistake.
    if (decoration.anchor === to) {
      return false
    }

    if (!warnedExtensions.has(extensionName)) {
      warnedExtensions.add(extensionName)
      console.warn(
        `[tiptap warn]: Extension "${extensionName}" returned a decoration outside the ` +
          `requested range [${from}, ${to}). It was ignored.`,
      )
    }

    return false
  })
}
