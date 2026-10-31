import type { Node } from 'prosemirror-model'
import type { Transaction } from 'prosemirror-state'
import type { Step } from 'prosemirror-transform'
import type { PositionMigrationPlan, PositionNode } from '../../../../types/PositionMigration.js'
import type { ProsemirrorBinding } from '../../binding/ProsemirrorBinding.js'
import { getPositionContent } from './getPositionContent.js'
import { isNodeMarkupChange } from './isNodeMarkupChange.js'

const isTextReplacement = (step: Step, doc: Node) => {
  const json = step.toJSON()
  const slice = json.slice ?? { content: [] }

  if (json.stepType !== 'replace' || slice.openStart > 0 || slice.openEnd > 0) {
    return false
  }

  const from = doc.resolve(json.from)
  const to = doc.resolve(json.to)
  const textOnly = slice.content.every((node: { type: string }) => node.type === 'text')

  return textOnly && from.parent.isTextblock && from.sameParent(to)
}

const indexNodes = (doc: Node) => {
  const nodes = new Map<Node, number[]>()

  doc.descendants((node, position) => {
    const positions = nodes.get(node) ?? []
    positions.push(position)
    nodes.set(node, positions)
  })

  return nodes
}

const findMovedNode = (
  node: Node,
  offset: number,
  step: number,
  indexes: Map<Node, number[]>[],
) => {
  // Equal content may be a copy. Only a unique node object identifies a move.
  if (indexes[step].get(node)?.length !== 1) {
    return null
  }

  for (let targetStep = step + 1; targetStep < indexes.length; targetStep += 1) {
    const target = indexes[targetStep].get(node)

    if (target?.length === 1) {
      return { position: target[0] + offset, step: targetStep }
    }
  }

  return null
}

const findMovedPosition = (
  position: number,
  step: number,
  docs: Node[],
  indexes: Map<Node, number[]>[],
) => {
  const original = docs[step].resolve(position)
  const candidates: { node: Node; offset: number }[] = []
  const child = docs[step].nodeAt(position)

  if (child && !child.isText) {
    candidates.push({ node: child, offset: 0 })
  }

  for (let depth = original.depth; depth > 0; depth -= 1) {
    candidates.push({ node: original.node(depth), offset: position - original.before(depth) })
  }

  for (const candidate of candidates) {
    const moved = findMovedNode(candidate.node, candidate.offset, step, indexes)

    if (moved) {
      return moved
    }
  }

  return null
}

const mapCharacterPosition = (
  position: number,
  transaction: Transaction,
  docs: Node[],
  indexes: Map<Node, number[]>[],
) => {
  for (let step = 0; step < transaction.mapping.maps.length; step += 1) {
    const mapping = transaction.mapping.maps[step]
    const start = mapping.mapResult(position, 1)
    const end = mapping.mapResult(position + 1, -1)

    if (!start.deleted && !end.deleted && end.pos === start.pos + 1) {
      position = start.pos
      continue
    }

    if (isNodeMarkupChange(transaction.steps[step], docs[step], docs[step + 1], position)) {
      continue
    }

    const moved = findMovedPosition(position, step, docs, indexes)

    if (!moved) {
      return null
    }

    position = moved.position
    step = moved.step - 1
  }

  return position
}

export const mapPositionMigration = (
  transaction: Transaction,
  binding: ProsemirrorBinding,
  previous: PositionMigrationPlan | null,
): PositionMigrationPlan | null => {
  // Appended transactions may run before the view writes the preceding change to Yjs.
  const pending =
    previous?.doc === transaction.before && previous.doc !== binding.syncedDoc ? previous : null

  // Ordinary text edits retain Yjs character identities without structural migration.
  if (
    !transaction.docChanged ||
    !binding.prosemirrorView ||
    (!pending &&
      transaction.steps.every((step, index) => isTextReplacement(step, transaction.docs[index])))
  ) {
    return pending
  }

  // A transaction appended in the same dispatch (an anchor extension marking a
  // heading up after the keystroke that typed into it) can leave the fragment
  // one write behind the transaction's before-state. Zipping against that
  // stale fragment throws or maps identities onto the wrong characters (the
  // synchronized-text check in getPositionContent), so skip the migration for
  // this transaction; positions fall back to the default prosemirror mapping.
  // After a remote update the syncedDoc snapshot lags the view while the
  // fragment itself is current, so snapshot identity is not divergence.
  let source
  try {
    source = pending ?? getPositionContent(binding.type, transaction.before)
  } catch {
    return null
  }
  const docs = [...transaction.docs, transaction.doc]
  const indexes = docs.map(indexNodes)
  const characters = source.characters.map(character => ({
    ...character,
    position:
      character.position === null
        ? null
        : mapCharacterPosition(character.position, transaction, docs, indexes),
  }))
  const mapNode = (node: PositionNode) => ({
    ...node,
    position:
      node.position === null
        ? null
        : mapCharacterPosition(node.position, transaction, docs, indexes),
    end: node.end === null ? null : mapCharacterPosition(node.end, transaction, docs, indexes),
  })

  return {
    doc: transaction.doc,
    characters,
    nodes: source.nodes.map(mapNode),
    emptyTexts: source.emptyTexts.map(mapNode),
  }
}
