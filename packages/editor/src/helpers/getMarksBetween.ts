import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

import type { MarkRange } from '../types.js'
import { getMarkRange } from './getMarkRange.js'

export function getMarksBetween(from: number, to: number, doc: ProseMirrorNode): MarkRange[] {
  const marks: MarkRange[] = []

  // get all inclusive marks on empty selection
  if (from === to) {
    doc
      .resolve(from)
      .marks()
      .forEach(mark => {
        const $pos = doc.resolve(from)
        const range = getMarkRange($pos, mark.type)

        if (!range) {
          return
        }

        marks.push({
          mark,
          ...range,
        })
      })
  } else {
    doc.nodesBetween(from, to, (node, pos) => {
      if (!node || node?.nodeSize === undefined) {
        return
      }

      marks.push(
        ...node.marks.map(mark => ({
          from: pos,
          to: pos + node.nodeSize,
          mark,
        })),
      )
    })
  }

  return marks
}
