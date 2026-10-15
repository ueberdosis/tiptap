import type { PositionTransfer } from '../../../../types/PositionMigration.js'
import * as Y from 'yjs'

const adjacentTargets = (left: PositionTransfer, right: PositionTransfer) => {
  if (!left.target || !right.target) {
    return left.target === right.target
  }

  return (
    left.target.client === right.target.client &&
    left.target.assoc === right.target.assoc &&
    left.target.boundary === right.target.boundary &&
    left.target.tname === right.target.tname &&
    left.target.clock + left.source.length === right.target.clock &&
    Y.compareIDs(left.target.type, right.target.type)
  )
}

export const mergePositionTransfers = (transfers: PositionTransfer[]) => {
  const merged: PositionTransfer[] = []

  transfers.forEach(transfer => {
    const previous = merged[merged.length - 1]

    if (
      previous &&
      previous.source.client === transfer.source.client &&
      previous.source.boundary === transfer.source.boundary &&
      previous.source.clock + previous.source.length === transfer.source.clock &&
      adjacentTargets(previous, transfer)
    ) {
      previous.source.length += transfer.source.length
      return
    }

    merged.push({ ...transfer, source: { ...transfer.source } })
  })

  return merged
}
