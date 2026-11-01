import type { PositionCharacter } from '../../../../types/PositionMigration.js'
import * as Y from 'yjs'
import { getTextCharacters } from './getTextCharacters.js'

const retainedCharacters = (
  characters: PositionCharacter[],
  desired: Map<string, number>,
  length: number,
) => {
  const retained = [{ current: -1, target: -1 }]

  characters.forEach((character, index) => {
    const target = desired.get(`${character.client}:${character.clock}`)

    if (target !== undefined && target > retained[retained.length - 1].target) {
      retained.push({ current: index, target })
    }
  })
  retained.push({ current: characters.length, target: length })
  return retained
}

export const syncPositionText = (
  type: Y.XmlText,
  text: string,
  position: number,
  desired: Map<number | null, PositionCharacter>,
  sources: Set<string>,
) => {
  const characters = getTextCharacters(type)
  const indexes = new Map<string, number>()

  for (let index = 0; index < text.length; index += 1) {
    const character = desired.get(position + index)

    if (character) {
      indexes.set(`${character.client}:${character.clock}`, index)
    }
  }

  const retained = retainedCharacters(characters, indexes, text.length)

  // Work backwards so replacements leave the remaining source indexes unchanged.
  for (let index = retained.length - 1; index > 0; index -= 1) {
    const left = retained[index - 1]
    const right = retained[index]
    const existing = characters.slice(left.current + 1, right.current)
    const replacement = text.slice(left.target + 1, right.target)

    // Equal text cannot make an old item represent a different character.
    if (
      !existing.some(character => sources.has(`${character.client}:${character.clock}`)) &&
      existing.map(character => character.text).join('') === replacement
    ) {
      continue
    }

    type.delete(left.current + 1, existing.length)
    type.insert(left.current + 1, replacement)
  }

  return getTextCharacters(type, position)
}
