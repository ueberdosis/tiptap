import type { PositionNode, PositionTransfer } from '../../../../types/PositionMigration.js'

export const getPositionNodeTransfers = (
  nodes: PositionNode[],
  starts: Map<number, NonNullable<PositionTransfer['target']>>,
  ends: Map<number, NonNullable<PositionTransfer['target']>>,
  emptyTexts: PositionNode[],
) => {
  const transfers: PositionTransfer[] = []

  nodes.forEach(node => {
    const start = node.position === null ? null : (starts.get(node.position) ?? null)
    transfers.push({ source: { ...node.id, length: 1 }, target: start })
  })

  const types = [...nodes, ...emptyTexts]
  types.forEach(node => {
    const start = node.position === null ? null : (starts.get(node.position) ?? null)
    const end = node.end === null ? null : (ends.get(node.end) ?? null)
    for (const boundary of ['start', 'end'] as const) {
      const target = boundary === 'start' ? start : end
      transfers.push({
        source: { ...node.id, length: 1, boundary },
        target: target
          ? { client: target.client, clock: target.clock, type: null, boundary }
          : null,
      })
    }
  })

  return transfers
}
