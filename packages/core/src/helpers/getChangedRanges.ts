import { Transform, Step } from 'prosemirror-transform'
import { Range } from '../types'
import { removeDuplicates } from '../utilities/removeDuplicates'

export type ChangedRange = {
  oldRange: Range,
  newRange: Range,
}

/**
 * Removes duplicated ranges and ranges that are
 * fully captured by other ranges.
 */
function simplifyChangedRanges(changes: ChangedRange[]): ChangedRange[] {
  const uniqueChanges = removeDuplicates(changes)

  return uniqueChanges.length === 1
    ? uniqueChanges
    : uniqueChanges.filter((change, index) => {
      const rest = uniqueChanges.filter((_, i) => i !== index)

      return !rest.some(otherChange => {
        return change.oldRange.from >= otherChange.oldRange.from
          && change.oldRange.to <= otherChange.oldRange.to
          && change.newRange.from >= otherChange.newRange.from
          && change.newRange.to <= otherChange.newRange.to
      })
    })
}

/**
 * Returns a list of changed ranges
 * based on the first and last state of all steps.
 */
export function getChangedRanges(transform: Transform): ChangedRange[] {
  const { mapping, steps } = transform
  const changes: ChangedRange[] = []

  mapping.maps.forEach((stepMap, index) => {
    const ranges: Range[] = []

    // This accounts for step changes where no range was actually altered
    // e.g. when setting a mark, node attribute, etc.
    // @ts-ignore
    if (!stepMap.ranges.length) {
      const { from, to } = steps[index] as Step & {
        from?: number,
        to?: number,
      }

      if (from === undefined || to === undefined) {
        return
      }

      ranges.push({ from, to })
    } else {
      stepMap.forEach((from, to) => {
        ranges.push({ from, to })
      })
    }

    ranges.forEach(({ from, to }) => {
      const newStart = mapping.slice(index).map(from, -1)
      const newEnd = mapping.slice(index).map(to)
      const oldStart = mapping.invert().map(newStart, -1)
      const oldEnd = mapping.invert().map(newEnd)

      changes.push({
        oldRange: {
          from: oldStart,
          to: oldEnd,
        },
        newRange: {
          from: newStart,
          to: newEnd,
        },
      })
    })
  })

  return simplifyChangedRanges(changes)
}
