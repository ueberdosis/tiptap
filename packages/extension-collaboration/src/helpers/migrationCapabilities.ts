import type { Migration } from '@tiptap/core'

/**
 * Awareness state published for collaboration servers to validate clients.
 * Values are self-reported by the editor app (self-managed deployments).
 */
export interface CollabMigrationCapabilities {
  /**
   * Whether the editor was configured with a non-empty `migrations` array.
   */
  migrationsEnabled: boolean
  /**
   * Highest migration version defined locally (`max(migrations[].version)`).
   * `null` when {@link CollabMigrationCapabilities.migrationsEnabled} is `false`.
   */
  maxMigrationVersion: number | null
}

/**
 * Awareness field name for {@link CollabMigrationCapabilities}.
 * @example provider.awareness.getLocalState()?.tiptap__migrationCapabilities
 */
export const TIPTAP_AWARENESS_MIGRATION_KEY = 'tiptap__migrationCapabilities'

export type CollaborationAwarenessProvider = {
  awareness: {
    setLocalStateField: (field: string, value: unknown) => void
  }
}

/**
 * Derives collaboration migration capabilities from the editor migrations config.
 */
export function getCollabMigrationCapabilities(
  migrations?: Migration[] | null,
): CollabMigrationCapabilities {
  if (!migrations?.length) {
    return {
      migrationsEnabled: false,
      maxMigrationVersion: null,
    }
  }

  return {
    migrationsEnabled: true,
    maxMigrationVersion: Math.max(...migrations.map(migration => migration.version)),
  }
}

/**
 * Publishes {@link CollabMigrationCapabilities} on the provider awareness object.
 */
export function syncMigrationCapabilitiesToAwareness(
  provider: CollaborationAwarenessProvider,
  capabilities: CollabMigrationCapabilities,
): void {
  provider.awareness.setLocalStateField(TIPTAP_AWARENESS_MIGRATION_KEY, capabilities)
}
