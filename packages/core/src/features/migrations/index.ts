/**
 * Document migrations for versioned schema upgrades.
 *
 * Register migrations on the editor via the `migrations` option. When loaded content has a
 * lower `documentVersion` than your latest migration, Tiptap runs migrations on init and
 * updates `documentVersion` (see `getData()`).
 *
 * @packageDocumentation
 */

export { applyMigrationStep, compileOps, createMigration, migrateDocument } from './migrations.js'

export * from './ops.js'

export type {
  AddMarkAttributeOp,
  AddMarkOp,
  MigrationOperation,
  OpCondition,
  RemoveAttrOp,
  RemoveMarkAttributeOp,
  RemoveMarkOp,
  RemoveNodeOp,
  RenameAttrOp,
  RenameMarkAttributeOp,
  RenameMarkOp,
  RenameNodeOp,
  SetAttrOp,
  UnwrapNodeOp,
  WrapNodeOp,
} from './types.js'
