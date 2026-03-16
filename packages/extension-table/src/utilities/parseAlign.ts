export enum TableCellAlign {
  Left = 'left',
  Right = 'right',
  Center = 'center',
}

export function normalizeTableCellAlign(value: unknown): TableCellAlign | null {
  if (value === TableCellAlign.Left || value === TableCellAlign.Right || value === TableCellAlign.Center) {
    return value
  }

  return null
}

export function parseAlign(element: HTMLElement): TableCellAlign | null {
  const styleAlign = (element.style.textAlign || '').trim().toLowerCase()
  const attrAlign = (element.getAttribute('align') || '').trim().toLowerCase()
  const align = styleAlign || attrAlign

  return normalizeTableCellAlign(align)
}

export function createAlignAttribute() {
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
