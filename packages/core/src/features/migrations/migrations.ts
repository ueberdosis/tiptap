import type { JSONContent, Migration } from '../../types.js'
import type { ApplyOpResult, MigrationOperation } from './types.js'
import { applyOp } from './ops.js'

export function createMigration(
  version: number,
  migrate: (node: JSONContent) => JSONContent | JSONContent[] | null,
): Migration
export function createMigration(version: number, ops: MigrationOperation[]): Migration
export function createMigration(
  version: number,
  input: ((node: JSONContent) => JSONContent | JSONContent[] | null) | MigrationOperation[],
): Migration {
  if (typeof input === 'function') {
    return { version, migrate: input }
  }

  return { version, migrate: compileOps(input) }
}

function compileOps(
  ops: MigrationOperation[],
): (node: JSONContent) => JSONContent | JSONContent[] | null {
  const applyAll = (node: JSONContent): ApplyOpResult => {
    let result: ApplyOpResult = node

    for (const op of ops) {
      result = applyOp(result as JSONContent, op)

      if (result === null) {
        return null
      }

      if (Array.isArray(result)) {
        return result.flatMap(applyAll)
      }
    }

    return result
  }

  return node => applyAll(node)
}

function validateMigrations(migrations: Migration[]): void {
  const versions = migrations.map(m => m.version)

  if (new Set(versions).size !== versions.length) {
    throw new Error('Duplicate migration versions')
  }
}

export function migrateDocument(
  doc: JSONContent,
  migrations: Migration[],
  from: number,
  to: number,
): JSONContent {
  validateMigrations(migrations)

  const applicable = migrations
    .filter(m => m.version > from && m.version <= to)
    .sort((a, b) => a.version - b.version)

  let content = { ...doc }

  for (const migration of applicable) {
    content = applyMigration(content, migration)
  }

  return content
}

function applyMigration(doc: JSONContent, migration: Migration): JSONContent {
  const walk = (node: JSONContent): JSONContent | JSONContent[] | null => {
    let processed = { ...node }

    if (processed.content) {
      processed.content = processed.content.flatMap(child => {
        const result = walk(child)
        return result === null ? [] : result
      })
    }

    return migration.migrate(processed)
  }

  const root = walk(doc)

  if (!root) {
    return doc
  }

  if (Array.isArray(root)) {
    return { type: 'doc', content: root }
  }

  return root
}
