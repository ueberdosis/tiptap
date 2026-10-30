import type { PositionNode, PositionTransfer } from '../../../../types/PositionMigration.js'
import * as Y from 'yjs'

export const getPositionNodeTransfers = (
  nodes: PositionNode[],
  starts: Map<number, NonNullable<PositionTransfer['target']>>,
  ends: Map<number, NonNullable<PositionTransfer['target']>>,
  emptyTexts: PositionNode[],
) => {
  const transfers: PositionTransfer[] = []

  nodes.forEach(node => {
    const start = node.position === null ? null : (starts.get(node.position) ?? null)

    if (start && Y.compareIDs(node.id, start)) {
      return
    }

    transfers.push({ source: { ...node.id, length: 1 }, target: start })
  })

  const types = [...nodes, ...emptyTexts]
  for (const boundary of ['start', 'end'] as const) {
    const destinations = boundary === 'start' ? starts : ends
    types.forEach(node => {
      const position = boundary === 'start' ? node.position : node.end
      const target = position === null ? null : (destinations.get(position) ?? null)

      if (target && Y.compareIDs(node.id, target)) {
        return
      }

      transfers.push({
        source: { ...node.id, length: 1, boundary },
        target: target
          ? { client: target.client, clock: target.clock, type: null, boundary }
          : null,
      })
    })
  }

  return transfers
}
