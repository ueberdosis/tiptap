import type { Decoration } from '../Decoration.js'

// Warn once per extension per page load. createInRange runs on every keystroke
const warnedOutOfRangeExtensions = new Set<string>()

/**
 * Filter decorations that are out of range.
 * @param decorations The decorations to filter.
 * @param from The start of the range.
 * @param to The end of the range.
 * @param extensionName The name of the extension that created the decorations.
 * @returns The filtered decorations.
 */
export function filterOutOfRangeDecorations(
  decorations: Decoration[],
  from: number,
  to: number,
  extensionName: string,
): Decoration[] {
  return decorations.filter(decoration => {
    if (decoration.anchor >= from && decoration.anchor <= to) {
      return true
    }

    if (!warnedOutOfRangeExtensions.has(extensionName)) {
      warnedOutOfRangeExtensions.add(extensionName)
      console.warn(
        `[tiptap warn]: Extension "${extensionName}" returned a decoration outside the ` +
          `requested range [${from}, ${to}). It was ignored.`,
      )
    }

    return false
  })
}
