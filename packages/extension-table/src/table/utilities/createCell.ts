import type { Fragment, Node as ProsemirrorNode, NodeType } from '@tiptap/pm/model'

/**
 * Build one table cell, optionally with content.
 */
export function createCell(
  cellType: NodeType,
  cellContent?: Fragment | ProsemirrorNode | Array<ProsemirrorNode>,
): ProsemirrorNode | null | undefined {
  if (cellContent) {
    return cellType.createChecked(null, cellContent)
  }

  return cellType.createAndFill()
}
