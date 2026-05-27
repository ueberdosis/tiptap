import type { JSONContent } from '../../types.js'
import type {
  AddMarkAttributeOp,
  AddMarkOp,
  ApplyOpResult,
  MarkCondition,
  MigrationOperation,
  RemoveAttrOp,
  RemoveMarkAttributeOp,
  RemoveMarkOp,
  RenameAttrOp,
  RenameMarkAttributeOp,
  RenameMarkOp,
  RenameNodeOp,
  SetAttrOp,
  UnwrapNodeOp,
  WrapNodeOp,
} from './types.js'

export function renameNode(
  from: string,
  to: string,
  options?: { if?: MarkCondition; renameAttr?: Record<string, string> },
): RenameNodeOp {
  return { type: 'renameNode', from, to, if: options?.if, renameAttr: options?.renameAttr }
}

export function renameAttr(nodeType: string, from: string, to: string): RenameAttrOp {
  return { type: 'renameAttr', nodeType, from, to }
}

export function setAttr(
  nodeType: string,
  key: string,
  value: unknown,
  condition?: MarkCondition,
): SetAttrOp {
  return { type: 'setAttr', nodeType, key, value, if: condition }
}

export function removeAttr(nodeType: string, key: string, condition?: MarkCondition): RemoveAttrOp {
  return { type: 'removeAttr', nodeType, key, if: condition }
}

export function unwrapNode(nodeType: string, condition?: MarkCondition): UnwrapNodeOp {
  return { type: 'unwrapNode', nodeType, if: condition }
}

export function wrapNode(
  nodeType: string,
  wrapper: JSONContent,
  condition?: MarkCondition,
): WrapNodeOp {
  return { type: 'wrapNode', nodeType, wrapper, if: condition }
}

export function renameMark(
  from: string,
  to: string,
  options?: { if?: MarkCondition; renameAttr?: Record<string, string> },
): RenameMarkOp {
  return { type: 'renameMark', from, to, if: options?.if, renameAttr: options?.renameAttr }
}

export function removeMark(markType: string, condition?: MarkCondition): RemoveMarkOp {
  return { type: 'removeMark', markType, if: condition }
}

export function addMark(markType: string, attrs?: Record<string, any>): AddMarkOp {
  return { type: 'addMark', markType, attrs }
}

export function addMarkAttribute(
  markType: string,
  key: string,
  value: unknown,
): AddMarkAttributeOp {
  return { type: 'addMarkAttribute', markType, key, value }
}

export function removeMarkAttribute(markType: string, key: string): RemoveMarkAttributeOp {
  return { type: 'removeMarkAttribute', markType, key }
}

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
  condition?: MarkCondition,
): boolean {
  if (!condition?.attrs) {
    return true
  }

  return Object.entries(condition.attrs).every(([key, value]) => target.attrs?.[key] === value)
}

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
