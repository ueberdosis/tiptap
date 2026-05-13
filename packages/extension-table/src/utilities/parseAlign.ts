import type { Attribute } from '@tiptap/core'

/**
 * Supported table cell alignment values
 */
export enum TableCellAlign {
  Left = 'left',
  Right = 'right',
  Center = 'center',
}

/**
 * Normalize unknown input into a supported table alignment
 *
 * @param value - A potential alignment value
 * @returns A valid TableCellAlign value or null
 */
export function normalizeTableCellAlign(value: unknown): TableCellAlign | null {
  if (value === TableCellAlign.Left || value === TableCellAlign.Right || value === TableCellAlign.Center) {
    return value
  }

  return null
}

/**
 * Parse table cell alignment from an HTML element
 *
 * Prefers inline style (${"`"}text-align${"`"}) and falls back to the legacy
 * ${"`"}align${"`"} attribute.
 *
 * @param element - The table cell/header DOM element
 * @returns A valid TableCellAlign value or null
 */
export function parseAlign(element: HTMLElement): TableCellAlign | null {
  const styleAlign = (element.style.textAlign || '').trim().toLowerCase()
  const attrAlign = (element.getAttribute('align') || '').trim().toLowerCase()
  const align = styleAlign || attrAlign

  return normalizeTableCellAlign(align)
}

/**
 * Normalize alignment from a generic attrs object that may include an align field
 *
 * @param attributes - A node attrs-like object with an optional align field
 * @returns A valid TableCellAlign value or null.
 */
export function normalizeTableCellAlignFromAttributes(
  attributes: { align?: TableCellAlign } | null | undefined,
): TableCellAlign | null {
  return normalizeTableCellAlign(attributes?.align)
}

/**
 * Create a reusable Tiptap attribute config for table alignment
 *
 * @returns A Tiptap Attribute definition that parses and renders table alignment
 */
export function createAlignAttribute(): Attribute {
  return {
    default: null,
    parseHTML: (element: HTMLElement) => parseAlign(element),
    renderHTML: (attributes: { align?: TableCellAlign | null }) => {
      if (!attributes.align) {
        return {}
      }

      return {
        style: `text-align: ${attributes.align}`,
      }
    },
  }
}
