import type { Attributes } from '@tiptap/core'

import { extractStyleProperty } from './extract-style-property.js'

/**
 * Border sides supported by the table cell schema.
 */
const BORDER_SIDES = ['Top', 'Bottom', 'Left', 'Right'] as const

/**
 * Creates Tiptap attribute definitions for all 12 table cell border properties.
 *
 * Each side (top, bottom, left, right) gets three attributes:
 * - `border{Side}Width` — CSS width string preserving the original token (e.g. `"2px"`, `"0.5rem"`, `"thin"`)
 * - `border{Side}Style` — CSS border style string (e.g. `"solid"`, `"dashed"`)
 * - `border{Side}Color` — CSS color string preserving the original format (e.g. `"#000000"`)
 *
 * Parsing reads from the raw `style` attribute first to preserve the original
 * CSS values, falling back to the CSSOM computed value.
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
      parseHTML: (element: HTMLElement) => {
        return (
          extractStyleProperty(element.getAttribute('style'), `border-${cssSide}-width`) ||
          element.style.getPropertyValue(`border-${cssSide}-width`) ||
          null
        )
      },
      renderHTML: (attributes: Record<string, unknown>) => {
        const raw = attributes[widthKey]

        if (raw == null) {
          return {}
        }

        // Support numeric values from JSON (backward compat) by coercing to px
        const value = typeof raw === 'number' ? `${raw}px` : String(raw)

        return { style: `border-${cssSide}-width: ${value}` }
      },
    }

    attrs[styleKey] = {
      default: null,
      parseHTML: (element: HTMLElement) => {
        return (
          extractStyleProperty(element.getAttribute('style'), `border-${cssSide}-style`) ||
          element.style.getPropertyValue(`border-${cssSide}-style`) ||
          null
        )
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
        return (
          extractStyleProperty(element.getAttribute('style'), `border-${cssSide}-color`) ||
          element.style.getPropertyValue(`border-${cssSide}-color`) ||
          null
        )
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
