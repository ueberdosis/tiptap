import type { JSONContent } from '../../types.js'
import type {
  AddMarkAttributeOp,
  AddMarkOp,
  ApplyOpResult,
  OpCondition,
  MigrationOperation,
  RemoveAttrOp,
  RemoveMarkAttributeOp,
  RemoveMarkOp,
  RenameAttrOp,
  RenameMarkAttributeOp,
  RenameMarkOp,
  RemoveNodeOp,
  RenameNodeOp,
  SetAttrOp,
  UnwrapNodeOp,
  WrapNodeOp,
} from './types.js'

/**
 * Declarative migration step that renames a node type.
 *
 * @param from - Node type to match
 * @param to - New node type name
 * @param options - Optional attribute filter and attribute renames on the node
 * @returns A {@link MigrationOperation} for use with {@link createMigration}
 *
 * @example
 * ```ts
 * createMigration(2, [
 *   renameNode('legacyParagraph', 'paragraph'),
 *   renameNode('heading', 'title', { if: { attrs: { level: 1 } } } }),
 * ])
 * ```
 */
export function renameNode(
  from: string,
  to: string,
  options?: { if?: OpCondition; renameAttr?: Record<string, string> },
): RenameNodeOp {
  return { type: 'renameNode', from, to, if: options?.if, renameAttr: options?.renameAttr }
}

/**
 * Renames an attribute key on nodes of a given type.
 *
 * @param nodeType - Node type to match
 * @param from - Current attribute name
 * @param to - New attribute name
 *
 * @example
 * ```ts
 * createMigration(2, [renameAttr('heading', 'level', 'headingLevel')])
 * ```
 */
export function renameAttr(nodeType: string, from: string, to: string): RenameAttrOp {
  return { type: 'renameAttr', nodeType, from, to }
}

/**
 * Sets an attribute on matching nodes (merges into existing attrs).
 *
 * @param nodeType - Node type to match
 * @param key - Attribute name
 * @param value - Attribute value
 * @param condition - Optional attribute filter
 *
 * @example
 * ```ts
 * createMigration(2, [setAttr('heading', 'level', 1)])
 * ```
 */
export function setAttr(
  nodeType: string,
  key: string,
  value: unknown,
  condition?: OpCondition,
): SetAttrOp {
  return { type: 'setAttr', nodeType, key, value, if: condition }
}

/**
 * Removes an attribute from matching nodes.
 *
 * @param nodeType - Node type to match
 * @param key - Attribute name to remove
 * @param condition - Optional attribute filter
 *
 * @example
 * ```ts
 * createMigration(2, [removeAttr('heading', 'level')])
 * ```
 */
export function removeAttr(nodeType: string, key: string, condition?: OpCondition): RemoveAttrOp {
  return { type: 'removeAttr', nodeType, key, if: condition }
}

/**
 * Replaces a node with its children (removes the wrapper node).
 *
 * When combined with other ops in the same migration, subsequent steps run on each child.
 *
 * @param nodeType - Node type to unwrap
 * @param condition - Optional attribute filter
 *
 * @example
 * ```ts
 * createMigration(2, [unwrapNode('wrapper')])
 * ```
 */
export function unwrapNode(nodeType: string, condition?: OpCondition): UnwrapNodeOp {
  return { type: 'unwrapNode', nodeType, if: condition }
}

/**
 * Wraps a matching node inside a new parent node.
 *
 * The `wrapper` should not include `content`; the matched node becomes its only child.
 *
 * @param nodeType - Node type to wrap
 * @param wrapper - Parent node JSON (without `content`)
 * @param condition - Optional attribute filter
 *
 * @example
 * ```ts
 * createMigration(2, [
 *   wrapNode('image', { type: 'figure' }),
 * ])
 * ```
 */
export function wrapNode(
  nodeType: string,
  wrapper: JSONContent,
  condition?: OpCondition,
): WrapNodeOp {
  return { type: 'wrapNode', nodeType, wrapper, if: condition }
}

/**
 * Removes matching nodes from the document.
 *
 * Removing the document root throws when the migration is applied.
 *
 * @param nodeType - Node type to remove
 * @param condition - Optional attribute filter
 *
 * @example
 * ```ts
 * createMigration(2, [removeNode('deprecatedBlock')])
 * ```
 */
export function removeNode(nodeType: string, condition?: OpCondition): RemoveNodeOp {
  return { type: 'removeNode', nodeType, if: condition }
}

/**
 * Renames a mark type on text nodes.
 *
 * @param from - Mark type to match
 * @param to - New mark type name
 * @param options - Optional attribute filter and attribute renames on the mark
 *
 * @example
 * ```ts
 * createMigration(2, [renameMark('bold', 'strong')])
 * ```
 */
export function renameMark(
  from: string,
  to: string,
  options?: { if?: OpCondition; renameAttr?: Record<string, string> },
): RenameMarkOp {
  return { type: 'renameMark', from, to, if: options?.if, renameAttr: options?.renameAttr }
}

/**
 * Removes a mark from text nodes.
 *
 * @param markType - Mark type to remove
 * @param condition - Optional attribute filter on the mark
 *
 * @example
 * ```ts
 * createMigration(2, [removeMark('highlight')])
 * ```
 */
export function removeMark(markType: string, condition?: OpCondition): RemoveMarkOp {
  return { type: 'removeMark', markType, if: condition }
}

/**
 * Adds a mark to text nodes that do not already have it.
 *
 * @param markType - Mark type to add
 * @param attrs - Optional mark attributes
 *
 * @example
 * ```ts
 * createMigration(2, [addMark('placeholder', { 'data-id': 'x' })])
 * ```
 */
export function addMark(markType: string, attrs?: Record<string, any>): AddMarkOp {
  return { type: 'addMark', markType, attrs }
}

/**
 * Adds or overwrites an attribute on an existing mark.
 *
 * @param markType - Mark type to match
 * @param key - Attribute name
 * @param value - Attribute value
 *
 * @example
 * ```ts
 * createMigration(2, [addMarkAttribute('link', 'rel', 'noopener')])
 * ```
 */
export function addMarkAttribute(
  markType: string,
  key: string,
  value: unknown,
): AddMarkAttributeOp {
  return { type: 'addMarkAttribute', markType, key, value }
}

/**
 * Removes an attribute from a mark.
 *
 * @param markType - Mark type to match
 * @param key - Attribute name to remove
 *
 * @example
 * ```ts
 * createMigration(2, [removeMarkAttribute('link', 'target')])
 * ```
 */
export function removeMarkAttribute(markType: string, key: string): RemoveMarkAttributeOp {
  return { type: 'removeMarkAttribute', markType, key }
}

/**
 * Renames an attribute key on a mark.
 *
 * @param markType - Mark type to match
 * @param from - Current attribute name
 * @param to - New attribute name
 *
 * @example
 * ```ts
 * createMigration(2, [renameMarkAttribute('link', 'href', 'url')])
 * ```
 */
export function renameMarkAttribute(
  markType: string,
  from: string,
  to: string,
): RenameMarkAttributeOp {
  return { type: 'renameMarkAttribute', markType, from, to }
}

function applyRenameAttr(
  target: { attrs?: Record<string, any> },
  map?: Record<string, string>,
): Record<string, any> | undefined {
  if (!map) {
    return target.attrs
  }

  const attrs = { ...target.attrs }

  for (const [from, to] of Object.entries(map)) {
    if (from in attrs) {
      attrs[to] = attrs[from]
      delete attrs[from]
    }
  }

  return attrs
}

function matchesCondition(
  target: { attrs?: Record<string, any> },
  condition?: OpCondition,
): boolean {
  if (!condition?.attrs) {
    return true
  }

  return Object.entries(condition.attrs).every(([key, value]) => target.attrs?.[key] === value)
}

/**
 * Applies a single {@link MigrationOperation} to one JSON node.
 *
 * Used internally by {@link compileOps}. Returns the updated node, an array of nodes
 * after unwrap, or `null` when the node was removed.
 *
 * @param node - JSON node to transform
 * @param op - Declarative migration operation
 * @returns The transformed node, replacement nodes, or `null` if removed
 */
export function applyOp(node: JSONContent, op: MigrationOperation): ApplyOpResult {
  switch (op.type) {
    case 'renameNode': {
      if (node.type === op.from && matchesCondition(node, op.if)) {
        return { ...node, type: op.to, attrs: applyRenameAttr(node, op.renameAttr) }
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
      if (node.type === op.nodeType && matchesCondition(node, op.if)) {
        return { ...node, attrs: { ...node.attrs, [op.key]: op.value } }
      }

      return node
    }

    case 'removeAttr': {
      if (node.type === op.nodeType && node.attrs && matchesCondition(node, op.if)) {
        const attrs = { ...node.attrs }

        delete attrs[op.key]

        return { ...node, attrs }
      }

      return node
    }

    case 'unwrapNode': {
      if (node.type === op.nodeType && matchesCondition(node, op.if)) {
        return node.content || []
      }

      return node
    }

    case 'wrapNode': {
      if (node.type === op.nodeType && matchesCondition(node, op.if)) {
        const { content: _, ...wrapper } = op.wrapper

        return { ...wrapper, content: [node] }
      }

      return node
    }

    case 'removeNode': {
      if (node.type === op.nodeType && matchesCondition(node, op.if)) {
        return null
      }

      return node
    }

    case 'renameMark': {
      if (node.marks) {
        const renamed = node.marks.map(m =>
          m.type === op.from && matchesCondition(m, op.if)
            ? { ...m, type: op.to, attrs: applyRenameAttr(m, op.renameAttr) }
            : m,
        )

        return { ...node, marks: renamed }
      }

      return node
    }

    case 'removeMark': {
      if (node.marks) {
        const filtered = node.marks.filter(
          m => !(m.type === op.markType && matchesCondition(m, op.if)),
        )

        if (filtered.length === node.marks.length) {
          return node
        }

        return { ...node, marks: filtered }
      }

      return node
    }

    case 'addMark': {
      const newMark = op.attrs ? { type: op.markType, attrs: op.attrs } : { type: op.markType }

      if (node.marks) {
        if (node.marks.some(m => m.type === op.markType)) {
          return node
        }

        return { ...node, marks: [...node.marks, newMark] }
      }

      return { ...node, marks: [newMark] }
    }

    case 'addMarkAttribute': {
      if (node.marks) {
        const updated = node.marks.map(m =>
          m.type === op.markType ? { ...m, attrs: { ...m.attrs, [op.key]: op.value } } : m,
        )

        return { ...node, marks: updated }
      }

      return node
    }

    case 'removeMarkAttribute': {
      if (node.marks) {
        const updated = node.marks.map(m => {
          if (m.type !== op.markType || !m.attrs) {
            return m
          }

          const attrs = { ...m.attrs }

          delete attrs[op.key]

          return { ...m, attrs }
        })

        return { ...node, marks: updated }
      }

      return node
    }

    case 'renameMarkAttribute': {
      if (node.marks) {
        const updated = node.marks.map(m => {
          if (m.type !== op.markType || !m.attrs) {
            return m
          }

          const { [op.from]: value, ...rest } = m.attrs

          if (value !== undefined) {
            return { ...m, attrs: { ...rest, [op.to]: value } }
          }

          return m
        })

        return { ...node, marks: updated }
      }

      return node
    }

    default:
      return node
  }
}
