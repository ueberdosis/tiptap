import type { Transaction } from '@dibdab/pm/state'

type StepRange = [from: number, to: number]

export const getUpdatedRanges = ({ mapping }: Transaction): StepRange[] => {
  const ranges: StepRange[] = []

  mapping.maps.forEach((stepMap, i) => {
    stepMap.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
      ranges.push([mapping.slice(i + 1).map(newStart), mapping.slice(i + 1).map(newEnd)])
    })
  })

  return ranges
}

export default getUpdatedRanges
