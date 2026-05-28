import type { JSONContent, Migration } from '../../types.js'
import type { ApplyOpResult, MigrationOperation } from './types.js'
import { applyOp } from './ops.js'

/**
 * Creates a versioned migration for the editor `migrations` option.
 *
 * Pass either a list of declarative {@link MigrationOperation | operations}
 * (via helpers like {@link renameNode}) or a custom `migrate` function per node.
 *
 * @param version - Target schema version after this migration runs
 * @param migrate - Function that transforms a single JSON node
 * @returns A {@link Migration} definition
 *
 * @example Function-based migration
 * ```ts
 * createMigration(2, node => {
 *   if (node.type === 'legacyParagraph') {
 *     return { ...node, type: 'paragraph' }
 *   }
 *   return node
 * })
 * ```
 *
 * @example Declarative operations
 * ```ts
 * createMigration(2, [
 *   renameNode('legacyParagraph', 'paragraph'),
 *   renameAttr('heading', 'level', 'headingLevel'),
 * ])
 * ```
 */
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

  return { version, migrate: compileOps(input), steps: input }
}

/**
 * Compiles declarative operations into a per-node `migrate` function.
 *
 * Operations run in order on each node. {@link unwrapNode} may return multiple children;
 * remaining operations in the same migration are applied to each child.
 *
 * @param ops - Ordered list of migration operations
 * @returns A migrate function suitable for {@link Migration.migrate}
 *
 * @example
 * ```ts
 * const migrate = compileOps([renameNode('paragraph', 'section')])
 * migrate({ type: 'paragraph', content: [] })
 * // => { type: 'section', content: [] }
 * ```
 */
export function compileOps(
  ops: MigrationOperation[],
): (node: JSONContent) => JSONContent | JSONContent[] | null {
  const applyFrom = (node: JSONContent, startIndex: number): ApplyOpResult => {
    let result: ApplyOpResult = node

    for (let i = startIndex; i < ops.length; i++) {
      const op = ops[i]

      result = applyOp(result as JSONContent, op)

      if (result === null) {
        return null
      }

      if (Array.isArray(result)) {
        return result.flatMap(child => applyFrom(child, i + 1))
      }
    }

    return result
  }

  return node => applyFrom(node, 0)
}

/**
 * Applies a single {@link MigrationOperation} to a full document tree.
 *
 * Useful for tests and tooling. Runs the same tree walk as full migrations.
 *
 * @param doc - Document JSON (usually `{ type: 'doc', content: [...] }`)
 * @param step - One declarative operation
 * @returns The migrated document
 *
 * @example
 * ```ts
 * applyMigrationStep(doc, renameNode('paragraph', 'section'))
 * ```
 */
export function applyMigrationStep(doc: JSONContent, step: MigrationOperation): JSONContent {
  return applyMigration(doc, { version: 0, migrate: compileOps([step]) })
}

function validateMigrations(migrations: Migration[]): void {
  const versions = migrations.map(m => m.version)

  if (new Set(versions).size !== versions.length) {
    throw new Error('Duplicate migration versions')
  }
}

/**
 * Migrates document JSON from one version to another.
 *
 * Runs every migration where `from < version <= to`, in ascending version order.
 *
 * @param doc - Document JSON to migrate
 * @param migrations - All registered migrations
 * @param from - Current document version (exclusive lower bound)
 * @param to - Target document version (inclusive upper bound)
 * @returns Migrated document JSON
 *
 * @example
 * ```ts
 * migrateDocument(doc, migrations, 1, 3)
 * ```
 */
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
    throw new Error('[tiptap error]: Migration removed document root')
  }

  if (Array.isArray(root)) {
    return { type: 'doc', content: root }
  }

  return root
}
