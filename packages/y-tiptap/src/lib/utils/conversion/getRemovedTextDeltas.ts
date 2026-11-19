import type { TextDelta } from '../../../types/TextDelta.js'
import type { ComputeYChange } from '../../../types/YChange.js'
import * as Y from 'yjs'

export const getRemovedTextDeltas = (
  text: Y.XmlText,
  snapshot: Y.Snapshot,
  computeYChange?: ComputeYChange,
): TextDelta[] => {
  const formatted: TextDelta[] = text.toDelta(snapshot)
  if (formatted.some(delta => typeof delta.insert !== 'string')) return formatted
  // An empty snapshot marks every historical character as removed using its own ID.
  const removed: TextDelta[] = text.toDelta(Y.emptySnapshot, snapshot, computeYChange)
  const deltas: TextDelta[] = []
  let removedIndex = 0
  let removedOffset = 0

  for (const delta of formatted) {
    let offset = 0
    while (offset < delta.insert.length) {
      const removal = removed[removedIndex]
      const length = Math.min(delta.insert.length - offset, removal.insert.length - removedOffset)
      deltas.push({
        insert: delta.insert.slice(offset, offset + length),
        attributes: {
          ...delta.attributes,
          ychange: removal.attributes?.ychange ?? { type: 'removed' },
        },
      })
      offset += length
      removedOffset += length
      if (removedOffset === removal.insert.length) {
        removedIndex += 1
        removedOffset = 0
      }
    }
  }

  return deltas
}
