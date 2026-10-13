import type {
  PositionMigration,
  PositionMigrationCandidate,
  PositionMigrationIndex,
  PositionTransfer,
} from '../../../../types/PositionMigration.js'
import type { RelativePosition, Map as YMap } from 'yjs'

const indexes = new WeakMap<YMap<PositionMigration>, PositionMigrationIndex>()

export const getPositionMigrationCandidates = (
  store: YMap<PositionMigration>,
  position: RelativePosition,
) => {
  const identity = position.item ?? position.type

  if (!identity) {
    return []
  }

  let boundary: PositionTransfer['source']['boundary']

  if (!position.item) {
    boundary = position.assoc < 0 ? 'start' : 'end'
  }

  let index = indexes.get(store)

  // Migration records are append-only, so the map size detects index changes.
  if (!index || index.size !== store.size) {
    const clients = new Map<number, PositionMigrationCandidate[]>()

    store.forEach(migration =>
      migration.transfers.forEach(transfer => {
        const candidates = clients.get(transfer.source.client) ?? []
        candidates.push({ migration, transfer })
        clients.set(transfer.source.client, candidates)
      }),
    )
    index = { size: store.size, clients }
    indexes.set(store, index)
  }

  const candidates = (index.clients.get(identity.client) ?? []).filter(
    ({ transfer }) =>
      transfer.source.boundary === boundary &&
      transfer.source.clock <= identity.clock &&
      identity.clock < transfer.source.clock + transfer.source.length,
  )

  // A causally later transfer supersedes earlier ones. Concurrent transfers remain candidates.
  return candidates.filter(
    candidate =>
      !candidates.some(
        other =>
          other.migration !== candidate.migration &&
          other.migration.seen.some(
            ([client, clock]) =>
              client === candidate.migration.client && clock > candidate.migration.clock,
          ),
      ),
  )
}
