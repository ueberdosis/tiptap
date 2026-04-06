import type { Attribute } from '@tiptap/core'

/**
 * Creates a Tiptap attribute definition for table cell background color.
 *
 * Parses from the element's `style.backgroundColor` and renders
 * as an inline `background-color` style on the `<td>`/`<th>`.
 *
 * @return A Tiptap Attribute definition for background color
 */
export function createBackgroundAttribute(): Attribute {
  return {
    default: null,
    parseHTML: (element: HTMLElement) => {
      return element.style.backgroundColor || null
    },
    renderHTML: (attributes: { background?: string | null }) => {
      if (!attributes.background) {
        return {}
      }

      return {
        style: `background-color: ${attributes.background}`,
      }
    },
  }
}
