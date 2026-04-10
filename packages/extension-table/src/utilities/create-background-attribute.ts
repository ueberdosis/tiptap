import type { Attribute } from '@tiptap/core'

import { extractStyleProperty } from './extract-style-property.js'

/**
 * Creates a Tiptap attribute definition for table cell background color.
 *
 * Parses from the raw `style` attribute to preserve the original format
 * (e.g. `#rrggbb`) instead of the computed `rgb(...)` value that
 * `element.style.backgroundColor` would return.
 *
 * @return A Tiptap Attribute definition for background color
 */
export function createBackgroundAttribute(): Attribute {
  return {
    default: null,
    parseHTML: (element: HTMLElement) => {
      return (
        extractStyleProperty(element.getAttribute('style'), 'background-color') || element.style.backgroundColor || null
      )
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
