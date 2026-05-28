import { createMigration, renameNode } from '@tiptap/core'

/** Migrations shipped with this (older) app build. */
export const migrations = [
  createMigration(2, [renameNode('legacyParagraph', 'paragraph')]),
  createMigration(5, [renameNode('legacyHeading', 'heading')]),
]

export const LOCAL_MAX_MIGRATION_VERSION = Math.max(...migrations.map(m => m.version))
