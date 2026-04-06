import type { Attributes } from '@tiptap/core'

/**
 * Border sides supported by the table cell schema.
 */
const BORDER_SIDES = ['Top', 'Bottom', 'Left', 'Right'] as const

/**
 * Parses a CSS length value into a number of pixels.
 * Handles "1px", "2px", bare numbers, etc.
 *
 * @param value - A CSS length string (e.g. "1px", "2")
 * @return The numeric pixel value, or null if unparseable
 */
function parseCssLength(value: string | undefined | null): number | null {
  if (!value) {
    return null
  }
  const num = parseFloat(value)
  return Number.isNaN(num) ? null : num
}

/**
 * Creates Tiptap attribute definitions for all 12 table cell border properties.
 *
 * Each side (top, bottom, left, right) gets three attributes:
 * - `border{Side}Width` — numeric pixel value (parsed from `element.style.border{Side}Width`)
 * - `border{Side}Style` — CSS border style string (parsed from `element.style.border{Side}Style`)
 * - `border{Side}Color` — CSS color string (parsed from `element.style.border{Side}Color`)
 *
 * All attributes render as inline styles on the `<td>`/`<th>` element.
 *
 * @return An object containing 12 Tiptap attribute definitions
 */
export function createBorderAttributes(): Attributes {
  return BORDER_SIDES.reduce<Attributes>((attrs, side) => {
    const widthKey = `border${side}Width`
    const styleKey = `border${side}Style`
    const colorKey = `border${side}Color`
    const cssSide = side.toLowerCase()

    attrs[widthKey] = {
      default: null,
      parseHTML: (element: HTMLElement) => parseCssLength(element.style.getPropertyValue(`border-${cssSide}-width`)),
      renderHTML: (attributes: Record<string, unknown>) => {
        const raw = attributes[widthKey]

        if (raw == null) {
          return {}
        }

        const num = typeof raw === 'number' ? raw : parseFloat(String(raw))

        if (!Number.isFinite(num)) {
          return {}
        }

        return { style: `border-${cssSide}-width: ${num}px` }
      },
    }

    attrs[styleKey] = {
      default: null,
      parseHTML: (element: HTMLElement) => {
        const val = element.style.getPropertyValue(`border-${cssSide}-style`)
        return val || null
      },
      renderHTML: (attributes: Record<string, unknown>) => {
        if (!attributes[styleKey]) {
          return {}
        }
        return { style: `border-${cssSide}-style: ${attributes[styleKey]}` }
      },
    }

    attrs[colorKey] = {
      default: null,
      parseHTML: (element: HTMLElement) => {
        const val = element.style.getPropertyValue(`border-${cssSide}-color`)
        return val || null
      },
      renderHTML: (attributes: Record<string, unknown>) => {
        if (!attributes[colorKey]) {
          return {}
        }
        return { style: `border-${cssSide}-color: ${attributes[colorKey]}` }
      },
    }

    return attrs
  }, {})
}
