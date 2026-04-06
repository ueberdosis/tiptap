import type { Attributes } from '@tiptap/core'

/**
 * Threshold to distinguish between line-height multipliers (e.g. 1.5)
 * and absolute pixel values (e.g. 24). Values <= this threshold are
 * treated as multipliers (unitless), values above as pixels.
 */
const LINE_HEIGHT_MULTIPLIER_THRESHOLD = 10

/**
 * Parses a CSS length value into a number.
 * Handles "28px", "1.5", bare numbers, etc.
 *
 * @param value - A CSS length or number string
 * @return The numeric value, or null if unparseable
 */
function parseCssNumber(value: string | undefined | null): number | null {
  if (!value) {
    return null
  }
  const num = parseFloat(value)
  return Number.isNaN(num) ? null : num
}

/**
 * Creates Tiptap attribute definitions for paragraph/heading spacing and indentation.
 *
 * Returns 5 attributes:
 * - `spacingBefore` — margin-top in pixels
 * - `spacingAfter` — margin-bottom in pixels
 * - `lineHeight` — line-height as multiplier (unitless) or absolute pixels
 * - `indent` — padding-left in pixels
 * - `firstLineIndent` — text-indent in pixels
 *
 * @return An object containing 5 Tiptap attribute definitions
 */
export function createSpacingAttributes(): Attributes {
  return {
    spacingBefore: {
      default: null,
      parseHTML: (element: HTMLElement) => parseCssNumber(element.style.marginTop),
      renderHTML: (attributes: Record<string, unknown>) => {
        if (attributes.spacingBefore == null) {
          return {}
        }
        return { style: `margin-top: ${attributes.spacingBefore}px` }
      },
    },

    spacingAfter: {
      default: null,
      parseHTML: (element: HTMLElement) => parseCssNumber(element.style.marginBottom),
      renderHTML: (attributes: Record<string, unknown>) => {
        if (attributes.spacingAfter == null) {
          return {}
        }
        return { style: `margin-bottom: ${attributes.spacingAfter}px` }
      },
    },

    lineHeight: {
      default: null,
      parseHTML: (element: HTMLElement) => parseCssNumber(element.style.lineHeight),
      renderHTML: (attributes: Record<string, unknown>) => {
        if (attributes.lineHeight == null) {
          return {}
        }
        const val = attributes.lineHeight as number
        if (val <= LINE_HEIGHT_MULTIPLIER_THRESHOLD) {
          return { style: `line-height: ${val}` }
        }
        return { style: `line-height: ${val}px` }
      },
    },

    indent: {
      default: null,
      parseHTML: (element: HTMLElement) => parseCssNumber(element.style.paddingLeft),
      renderHTML: (attributes: Record<string, unknown>) => {
        if (attributes.indent == null) {
          return {}
        }
        return { style: `padding-left: ${attributes.indent}px` }
      },
    },

    firstLineIndent: {
      default: null,
      parseHTML: (element: HTMLElement) => parseCssNumber(element.style.textIndent),
      renderHTML: (attributes: Record<string, unknown>) => {
        if (attributes.firstLineIndent == null) {
          return {}
        }
        return { style: `text-indent: ${attributes.firstLineIndent}px` }
      },
    },
  }
}
