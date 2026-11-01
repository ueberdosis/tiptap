import type { Node } from 'prosemirror-model'
import type {
  PositionMigration,
  PositionMigrationPlan,
  PositionTransfer,
} from '../../../../types/PositionMigration.js'
import type { BindingMetadata } from '../../../../types/BindingMetadata.js'
import * as Y from 'yjs'
import { normalizePNodeContent } from '../../conversion/normalizePNodeContent.js'
import { updateYText } from '../../reconciliation/updateYText.js'
import { syncPositionText } from './syncPositionText.js'
import { writePositionMigration } from './writePositionMigration.js'
import { getPositionBoundaryTransfers } from './getPositionBoundaryTransfers.js'
import { getPositionNodeTransfers } from './getPositionNodeTransfers.js'
import { syncPositionElement } from './syncPositionElement.js'

export const applyPositionMigration = (
  fragment: Y.XmlFragment,
  plan: PositionMigrationPlan,
  metadata: BindingMetadata,
  store: Y.Map<PositionMigration>,
) => {
  const desired = new Map(plan.characters.map(character => [character.position, character]))
  const sources = new Set(
    plan.characters.map(character => `${character.client}:${character.clock}`),
  )
  const targets = new Map<number, NonNullable<PositionTransfer['target']>>()
  const nodeSources = new Map(plan.nodes.map(node => [`${node.id.client}:${node.id.clock}`, node]))
  const starts = new Map<number, NonNullable<PositionTransfer['target']>>()
  const ends = new Map<number, NonNullable<PositionTransfer['target']>>()

  const visit = (type: Y.XmlFragment, node: Node, position: number) => {
    const children = type.toArray()
    let offset = position

    normalizePNodeContent(node).forEach((child, index) => {
      const shared = children[index]

      if (Array.isArray(child)) {
        if (!(shared instanceof Y.XmlText) || !shared._item) {
          throw new Error('Position migration requires integrated text')
        }

        const text = child.map(node => node.text ?? '').join('')
        const characters = syncPositionText(shared, text, offset, desired, sources)
        const typeId = shared._item.id
        characters.forEach(character =>
          targets.set(character.position!, {
            client: character.client,
            clock: character.clock,
            type: typeId,
          }),
        )
        updateYText(shared, child, metadata)
        offset += text.length
        return
      }

      const element = syncPositionElement(type, index, child, offset, nodeSources, metadata)
      const identity = element._item!.id
      const target = {
        client: identity.client,
        clock: identity.clock,
        type: type._item?.id ?? null,
        ...(type._item ? {} : { tname: Y.findRootTypeKey(type) }),
      }
      starts.set(offset, target)
      ends.set(offset + child.nodeSize - 1, target)

      if (!child.isLeaf) {
        visit(element, child, offset + 1)
      }

      offset += child.nodeSize
    })
  }

  visit(fragment, plan.doc, 0)
  const transfers: PositionTransfer[] = []

  plan.characters.forEach(character => {
    const target = character.position === null ? null : (targets.get(character.position) ?? null)

    // Unchanged identities must not compete with another client's structural transfer.
    if (target && Y.compareIDs(character, target) && Y.compareIDs(character.type, target.type)) {
      return
    }

    transfers.push({
      source: { client: character.client, clock: character.clock, length: 1 },
      target,
    })
  })

  transfers.push(...getPositionBoundaryTransfers(plan.characters, targets))
  transfers.push(...getPositionNodeTransfers(plan.nodes, starts, ends, plan.emptyTexts))

  writePositionMigration(store, transfers)
}
