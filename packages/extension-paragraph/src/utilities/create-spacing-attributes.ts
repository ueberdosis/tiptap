import type { Attributes } from '@tiptap/core'

/** Pattern matching unitless numbers and px values only */
const UNITLESS_OR_PX = /^(-?(?:\d+\.?\d*|\.\d+))(px)?$/i

/**
 * Parses a CSS length value into a number of pixels.
 * Only accepts unitless values and `px` to avoid misinterpreting
 * other units (e.g. `1em`, `12pt`, `120%`) as pixel values.
 *
 * @param value - A CSS length or number string (e.g. "28px", "1.5")
 * @return The numeric pixel value, or null if unsupported or unparseable
 */
function parseCssPixelValue(value: string | undefined | null): number | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  const match = UNITLESS_OR_PX.exec(trimmed)

  if (!match) {
    return null
  }

  const num = Number(match[1])

  return Number.isFinite(num) ? num : null
}

/**
 * Parses a CSS line-height value as a string, preserving the original
 * format and units. Returns null if no value is set.
 *
 * @param value - A CSS line-height string (e.g. "1.5", "24px")
 * @return The original value string, or null if empty
 */
function parseCssLineHeight(value: string | undefined | null): string | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim()

  return trimmed || null
}

/**
 * Creates Tiptap attribute definitions for paragraph/heading spacing and indentation.
 *
 * Returns 5 attributes:
 * - `spacingBefore` — margin-top in pixels (number)
 * - `spacingAfter` — margin-bottom in pixels (number)
 * - `lineHeight` — line-height preserved as a string (e.g. "1.5", "24px")
 * - `indent` — padding-left in pixels (number)
 * - `firstLineIndent` — text-indent in pixels (number)
 *
 * @return An object containing 5 Tiptap attribute definitions
 */
export function createSpacingAttributes(): Attributes {
  return {
    spacingBefore: {
      default: null,
      parseHTML: (element: HTMLElement) => parseCssPixelValue(element.style.marginTop),
      renderHTML: (attributes: Record<string, unknown>) => {
        if (attributes.spacingBefore == null) {
          return {}
        }
        return { style: `margin-top: ${attributes.spacingBefore}px` }
      },
    },

    spacingAfter: {
      default: null,
      parseHTML: (element: HTMLElement) => parseCssPixelValue(element.style.marginBottom),
      renderHTML: (attributes: Record<string, unknown>) => {
        if (attributes.spacingAfter == null) {
          return {}
        }
        return { style: `margin-bottom: ${attributes.spacingAfter}px` }
      },
    },

    lineHeight: {
      default: null,
      parseHTML: (element: HTMLElement) => parseCssLineHeight(element.style.lineHeight),
      renderHTML: (attributes: Record<string, unknown>) => {
        if (attributes.lineHeight == null) {
          return {}
        }
        return { style: `line-height: ${attributes.lineHeight}` }
      },
    },

    indent: {
      default: null,
      parseHTML: (element: HTMLElement) => parseCssPixelValue(element.style.paddingLeft),
      renderHTML: (attributes: Record<string, unknown>) => {
        if (attributes.indent == null) {
          return {}
        }
        return { style: `padding-left: ${attributes.indent}px` }
      },
    },

    firstLineIndent: {
      default: null,
      parseHTML: (element: HTMLElement) => parseCssPixelValue(element.style.textIndent),
      renderHTML: (attributes: Record<string, unknown>) => {
        if (attributes.firstLineIndent == null) {
          return {}
        }
        return { style: `text-indent: ${attributes.firstLineIndent}px` }
      },
    },
  }
}
