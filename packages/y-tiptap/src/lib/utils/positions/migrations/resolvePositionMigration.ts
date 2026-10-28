import type { PositionMigrationCandidate } from '../../../../types/PositionMigration.js'
import * as Y from 'yjs'
import { getPositionMigrationStore } from './getPositionMigrationStore.js'
import { getPositionMigrationCandidates } from './getPositionMigrationCandidates.js'

const destination = (candidate: PositionMigrationCandidate, identity: Y.ID, assoc: number) => {
  const { source, target } = candidate.transfer

  if (!target) {
    return null
  }

  return new Y.RelativePosition(
    target.boundary ? Y.createID(target.client, target.clock) : target.type,
    target.tname ?? null,
    target.boundary
      ? null
      : Y.createID(target.client, target.clock + identity.clock - source.clock),
    target.assoc ?? assoc,
  )
}

const commonDestination = (
  candidates: PositionMigrationCandidate[],
  identity: Y.ID,
  assoc: number,
) => {
  const next = destination(candidates[0], identity, assoc)

  // Concurrent structural edits must agree on the destination.
  if (
    !next ||
    candidates.some(candidate => {
      const other = destination(candidate, identity, assoc)
      return !other || !Y.compareRelativePositions(next, other)
    })
  ) {
    return null
  }

  return next
}

const positionIdentity = (position: Y.RelativePosition) => {
  const identity = position.item ?? position.type

  if (!identity) {
    return null
  }

  let boundary = position.assoc < 0 ? 'start' : 'end'

  if (position.item) {
    boundary = 'item'
  }

  return `${identity.client}:${identity.clock}:${boundary}`
}

export const resolvePositionMigration = (fragment: Y.XmlFragment, position: Y.RelativePosition) => {
  const store = getPositionMigrationStore(fragment)
  const visited = new Set<string>()
  let current = position
  let identity = current.item ?? current.type

  while (identity) {
    const key = positionIdentity(current)!

    if (visited.has(key)) {
      return null
    }

    visited.add(key)
    const candidates = getPositionMigrationCandidates(store, current)

    if (candidates.length === 0) {
      return current
    }

    const next = commonDestination(candidates, identity, current.assoc)

    if (!next) {
      return null
    }

    if (positionIdentity(next) === key) {
      return next
    }

    current = next
    identity = next.item ?? next.type
  }

  return current
}
