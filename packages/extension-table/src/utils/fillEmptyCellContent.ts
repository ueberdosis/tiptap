import type { NodeType } from '@tiptap/pm/model'
import { Fragment } from '@tiptap/pm/model'

// ASCII whitespace only, so a non-breaking-space cell is not treated as empty.
const COLLAPSIBLE_WHITESPACE = /[ \t\r\n\f]+/g

/** Whether a cell/header element has no child elements and only collapsible whitespace. */
export function isEmptyCellElement(element: HTMLElement): boolean {
  if (element.children.length > 0) {
    return false
  }

  return (element.textContent ?? '').replace(COLLAPSIBLE_WHITESPACE, '') === ''
}

/** Builds a cell/header's minimal `block+` content, derived from the node type. */
export function fillEmptyCellContent(cellType: NodeType): Fragment {
  const filled = cellType.createAndFill()

  if (!filled) {
    throw new Error(`[tiptap error]: "${cellType.name}" has no default content to backfill.`)
  }

  return filled.content
}
