import type { Node } from 'prosemirror-model'
import type { Transaction } from 'prosemirror-state'
import { AddMarkStep, RemoveMarkStep, type Step } from 'prosemirror-transform'
import type {
  PositionMigrationContent,
  PositionMigrationPlan,
  PositionNode,
} from '../../../../types/PositionMigration.js'
import type { ProsemirrorBinding } from '../../binding/ProsemirrorBinding.js'
import { getPositionContent } from './getPositionContent.js'
import { getPositionRegion } from './getPositionRegion.js'
import { getRetainedEmptyTextTransfers } from './getRetainedEmptyTextTransfers.js'
import { isNodeMarkupChange } from './isNodeMarkupChange.js'

type PositionContent = Pick<PositionMigrationContent, 'characters' | 'nodes' | 'emptyTexts'>

const retainsYjsIdentities = (step: Step, doc: Node) => {
  if (step instanceof AddMarkStep || step instanceof RemoveMarkStep) {
    return true
  }

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

type NodeIndexes = (step: number) => Map<Node, number[]>

const findMovedNode = (
  node: Node,
  offset: number,
  step: number,
  docs: Node[],
  indexes: NodeIndexes,
) => {
  // Equal content may be a copy. Only a unique node object identifies a move.
  if (indexes(step).get(node)?.length !== 1) {
    return null
  }

  for (let targetStep = step + 1; targetStep < docs.length; targetStep += 1) {
    const target = indexes(targetStep).get(node)

    if (target?.length === 1) {
      return { position: target[0] + offset, step: targetStep }
    }
  }

  return null
}

const findMovedPosition = (position: number, step: number, docs: Node[], indexes: NodeIndexes) => {
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
    const moved = findMovedNode(candidate.node, candidate.offset, step, docs, indexes)

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
  indexes: NodeIndexes,
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

const mapPositionContent = (content: PositionContent, transaction: Transaction) => {
  const docs = [...transaction.docs, transaction.doc]
  const indexes: Map<Node, number[]>[] = []
  // Node indexes are only needed when a step deletes tracked content.
  const getIndexes = (step: number) => (indexes[step] ??= indexNodes(docs[step]))
  const map = (position: number | null) =>
    position === null ? null : mapCharacterPosition(position, transaction, docs, getIndexes)
  const mapNode = (node: PositionNode) => ({
    ...node,
    position: map(node.position),
    end: map(node.end),
  })

  return {
    characters: content.characters.map(character => ({
      ...character,
      position: map(character.position),
    })),
    nodes: content.nodes.map(mapNode),
    emptyTexts: content.emptyTexts.map(mapNode),
  }
}

export const mapPositionMigration = (
  transaction: Transaction,
  binding: ProsemirrorBinding,
  previous: PositionMigrationPlan | null,
): PositionMigrationPlan | null => {
  // Appended transactions may run before the view writes the preceding change to Yjs.
  const pending =
    previous?.doc === transaction.before && previous.doc !== binding.syncedDoc ? previous : null

  if (!transaction.docChanged || !binding.prosemirrorView) {
    return pending
  }

  const transactions = [...(pending?.transactions ?? []), transaction]

  if (
    (!pending || !('characters' in pending)) &&
    transaction.steps.every((step, index) => retainsYjsIdentities(step, transaction.docs[index]))
  ) {
    return { doc: transaction.doc, transactions }
  }

  // Yjs still matches the source document, so chained transactions are mapped from there again.
  const source = transactions[0].before
  const region = getPositionRegion(
    source,
    transaction.doc,
    transactions,
    binding.type,
    binding.mapping,
  )
  const content = transactions.reduce(
    mapPositionContent,
    getPositionContent(binding.type, source, region),
  )

  return {
    doc: transaction.doc,
    transactions,
    region,
    ...content,
    retainedTransfers: getRetainedEmptyTextTransfers(binding.type, source, region),
  }
}
