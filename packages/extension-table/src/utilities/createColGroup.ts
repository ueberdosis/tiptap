import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { DOMOutputSpec } from 'prosemirror-model'

export function createColGroup(
  node: ProseMirrorNode,
  cellMinWidth: number,
  overrideCol?: number,
  overrideValue?: any,
) {
  let totalWidth = 0
  let fixedWidth = true
  const colls: DOMOutputSpec[] = []
  const row = node.firstChild

  if (!row) {
    return {}
  }

  for (let i = 0, col = 0; i < row.childCount; i += 1) {
    const { colspan, colwidth } = row.child(i).attrs

    for (let j = 0; j < colspan; j += 1, col += 1) {
      const hasWidth = overrideCol === col ? overrideValue : colwidth && colwidth[j]
      const cssWidth = hasWidth ? `${hasWidth}px` : ''

      totalWidth += hasWidth || cellMinWidth

      if (!hasWidth) {
        fixedWidth = false
      }

      colls.push(['col', cssWidth ? { style: `width: ${cssWidth}` } : {}])
    }
  }

  const tableWidth = fixedWidth ? `${totalWidth}px` : ''
  const tableMinWidth = fixedWidth ? '' : `${totalWidth}px`

  const colgroup: DOMOutputSpec = ['colgroup', {}, ...colls]

  return { colgroup, tableWidth, tableMinWidth }
}
