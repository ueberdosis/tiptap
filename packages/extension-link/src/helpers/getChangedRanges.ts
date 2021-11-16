import { Range } from '@tiptap/core'
import { Transform } from 'prosemirror-transform'
import removeDuplicates from './removeDuplicates'

/**
 * Removes duplicated ranges and ranges that are
 * fully captured by other ranges.
 */
function simplifyChangedRanges(changes: Range[]): Range[] {
  const uniqueChanges = removeDuplicates(changes)

  return uniqueChanges.length === 1
    ? uniqueChanges
    : uniqueChanges.filter((change, index) => {
      const rest = uniqueChanges.filter((_, i) => i !== index)

      return !rest.some(otherChange => {
        return change.from >= otherChange.from
          && change.to <= otherChange.to
      })
    })
}

/**
 * Returns a list of changed ranges
 * based on the first and last state of all steps.
 */
export default function getChangedRanges(transform: Transform): Range[] {
  const { mapping } = transform
  const changes: Range[] = []

  mapping.maps.forEach((stepMap, index) => {
    stepMap.forEach((from, to) => {
      changes.push({
        from: mapping.slice(index).map(from, -1),
        to: mapping.slice(index).map(to),
      })
    })
  })

  return simplifyChangedRanges(changes)
}
