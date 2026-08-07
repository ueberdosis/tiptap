import type { Decoration } from '../Decoration.js'

export interface FilterOutOfRangeDecorationsOptions {
  decorations: Decoration[]
  from: number
  to: number
  /** The extension that created the decorations, used in the warning. */
  extensionName: string
  /** Extensions already warned about, so a buggy one warns once per editor. */
  warnedExtensions: Set<string>
}

/**
 * Filter decorations that are out of the half-open range `[from, to)`.
 * Must match the stale filter in `DecorationManager.rebuildRanges`.
 *
 * @param options The decorations, the range, and the warning bookkeeping.
 * @returns The filtered decorations.
 */
export function filterOutOfRangeDecorations({
  decorations,
  from,
  to,
  extensionName,
  warnedExtensions,
}: FilterOutOfRangeDecorationsOptions): Decoration[] {
  return decorations.filter(decoration => {
    if (decoration.anchor >= from && decoration.anchor < to) {
      return true
    }

    // At `to` only widgets belong to this block. Spanning ones belong to the next.
    if (decoration.anchor === to) {
      return decoration.kind === 'widget'
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
