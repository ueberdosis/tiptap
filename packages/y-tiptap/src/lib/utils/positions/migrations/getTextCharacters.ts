import type { PositionCharacter } from '../../../../types/PositionMigration.js'
import * as Y from 'yjs'

export const getTextCharacters = (type: Y.XmlText, position = 0) => {
  const characters: PositionCharacter[] = []

  if (!type._item) {
    throw new Error('Position tracking requires integrated text')
  }

  for (let item = type._start; item; item = item.right) {
    if (item.deleted || !item.countable) {
      continue
    }

    if (!(item.content instanceof Y.ContentString)) {
      throw new Error('Position tracking requires string text content')
    }

    // A Yjs string item spans consecutive clocks, one per UTF-16 code unit.
    for (let index = 0; index < item.length; index += 1) {
      characters.push({
        client: item.id.client,
        clock: item.id.clock + index,
        text: item.content.str[index],
        type: type._item.id,
        position: position + characters.length,
      })
    }
  }

  return characters
}
