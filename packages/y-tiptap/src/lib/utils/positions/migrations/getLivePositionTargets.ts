import type { PositionTransfer } from '../../../../types/PositionMigration.js'
import * as Y from 'yjs'
import { getTextCharacters } from './getTextCharacters.js'

export const getLivePositionTargets = (fragment: Y.XmlFragment) => {
  const targets = new Map<string, NonNullable<PositionTransfer['target']>>()
  const visit = (type: Y.XmlFragment) => {
    type.toArray().forEach(child => {
      if (child instanceof Y.XmlElement) {
        const identity = child._item!.id
        targets.set(`${identity.client}:${identity.clock}`, {
          client: identity.client,
          clock: identity.clock,
          type: type._item?.id ?? null,
          ...(type._item ? {} : { tname: Y.findRootTypeKey(type) }),
        })
        visit(child)
        return
      }

      if (!(child instanceof Y.XmlText) || !child._item) {
        return
      }

      const typeId = child._item.id
      getTextCharacters(child).forEach(character => {
        targets.set(`${character.client}:${character.clock}`, {
          client: character.client,
          clock: character.clock,
          type: typeId,
        })
      })
    })
  }

  visit(fragment)
  return targets
}
