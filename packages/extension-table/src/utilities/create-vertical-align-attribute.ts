import type { Attribute } from '@tiptap/core'

/**
 * Valid vertical alignment values for table cells.
 */
export type TableCellVerticalAlign = 'top' | 'middle' | 'bottom'

/**
 * Normalizes a value to a valid vertical alignment or null.
 *
 * @param value - A potential vertical alignment value
 * @return A valid vertical alignment or null
 */
function normalizeVerticalAlign(value: unknown): TableCellVerticalAlign | null {
  if (value === 'top' || value === 'middle' || value === 'bottom') {
    return value
  }

  return null
}

/**
 * Creates a Tiptap attribute definition for table cell vertical alignment.
 *
 * Parses from the element's `style.verticalAlign` and renders
 * as an inline `vertical-align` style on the `<td>`/`<th>`.
 *
 * @return A Tiptap Attribute definition for vertical alignment
 */
export function createVerticalAlignAttribute(): Attribute {
  return {
    default: null,
    parseHTML: (element: HTMLElement) => {
      return normalizeVerticalAlign(element.style.verticalAlign)
    },
    renderHTML: (attributes: { verticalAlign?: TableCellVerticalAlign | null }) => {
      if (!attributes.verticalAlign) {
        return {}
      }

      return {
        style: `vertical-align: ${attributes.verticalAlign}`,
      }
    },
  }
}
