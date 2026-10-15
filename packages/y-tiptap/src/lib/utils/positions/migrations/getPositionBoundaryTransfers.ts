import type { PositionCharacter, PositionTransfer } from '../../../../types/PositionMigration.js'
import * as Y from 'yjs'

export const getPositionBoundaryTransfers = (
  characters: PositionCharacter[],
  destinations: Map<number, NonNullable<PositionTransfer['target']>>,
) => {
  const types = new Map<string, PositionCharacter[]>()

  characters.forEach(character => {
    const key = `${character.type.client}:${character.type.clock}`
    const group = types.get(key) ?? []
    group.push(character)
    types.set(key, group)
  })

  const transfers: PositionTransfer[] = []

  types.forEach(group => {
    const first = group[0]
    const last = group[group.length - 1]
    const start = first.position === null ? undefined : destinations.get(first.position)
    const end = last.position === null ? undefined : destinations.get(last.position)
    if (!start || !Y.compareIDs(first.type, start.type)) {
      transfers.push({
        source: { ...first.type, length: 1, boundary: 'start' },
        target: start ? { ...start, assoc: 0 } : null,
      })
    }

    if (!end || !Y.compareIDs(last.type, end.type)) {
      transfers.push({
        source: { ...first.type, length: 1, boundary: 'end' },
        target: end ? { ...end, assoc: -1 } : null,
      })
    }
  })

  return transfers
}
