import type { JSONContent, Migration } from '../../types.js'

export type RenameNodeOp = {
  type: 'renameNode'
  from: string
  to: string
}

export type RenameAttrOp = {
  type: 'renameAttr'
  nodeType: string
  from: string
  to: string
}

export type SetAttrOp = {
  type: 'setAttr'
  nodeType: string
  key: string
  value: unknown
}

export type RemoveAttrOp = {
  type: 'removeAttr'
  nodeType: string
  key: string
}

export type UnwrapNodeOp = {
  type: 'unwrapNode'
  nodeType: string
}

export type WrapNodeOp = {
  type: 'wrapNode'
  nodeType: string
  wrapper: JSONContent
}

export type MigrationOperation =
  | RenameNodeOp
  | RenameAttrOp
  | SetAttrOp
  | RemoveAttrOp
  | UnwrapNodeOp
  | WrapNodeOp

export function renameNode(from: string, to: string): RenameNodeOp {
  return { type: 'renameNode', from, to }
}

export function renameAttr(nodeType: string, from: string, to: string): RenameAttrOp {
  return { type: 'renameAttr', nodeType, from, to }
}

export function setAttr(nodeType: string, key: string, value: unknown): SetAttrOp {
  return { type: 'setAttr', nodeType, key, value }
}

export function removeAttr(nodeType: string, key: string): RemoveAttrOp {
  return { type: 'removeAttr', nodeType, key }
}

export function unwrapNode(nodeType: string): UnwrapNodeOp {
  return { type: 'unwrapNode', nodeType }
}

export function wrapNode(nodeType: string, wrapper: JSONContent): WrapNodeOp {
  return { type: 'wrapNode', nodeType, wrapper }
}

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

type ApplyOpResult = JSONContent | JSONContent[] | null

function applyOp(node: JSONContent, op: MigrationOperation): ApplyOpResult {
  switch (op.type) {
    case 'renameNode': {
      if (node.type === op.from) {
        return { ...node, type: op.to }
      }

      return node
    }

    case 'renameAttr': {
      if (node.type === op.nodeType && node.attrs) {
        const { [op.from]: value, ...rest } = node.attrs

        if (value !== undefined) {
          return { ...node, attrs: { ...rest, [op.to]: value } }
        }
      }

      return node
    }

    case 'setAttr': {
      if (node.type === op.nodeType) {
        return { ...node, attrs: { ...node.attrs, [op.key]: op.value } }
      }

      return node
    }

    case 'removeAttr': {
      if (node.type === op.nodeType && node.attrs) {
        const attrs = { ...node.attrs }

        delete attrs[op.key]

        return { ...node, attrs }
      }

      return node
    }

    case 'unwrapNode': {
      if (node.type === op.nodeType) {
        return node.content || []
      }

      return node
    }

    case 'wrapNode': {
      if (node.type === op.nodeType) {
        const { content: _, ...wrapper } = op.wrapper

        return { ...wrapper, content: [node] }
      }

      return node
    }

    default:
      return node
  }
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
