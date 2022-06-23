import { Node } from 'prosemirror-model'
import { DecorationSet } from 'prosemirror-view'

import { createDeco, textBetween } from './utils'

export interface DecoratorCharacterOptions {
  type: string;
  predicate: (value: string) => boolean
  priority?: number
  content?: string
}

export class DecoratorCharacter {
  predicate: (value: string) => boolean

  content?: string

  type: string

  priority: number

  constructor(options: DecoratorCharacterOptions) {
    this.predicate = options.predicate
    this.type = options.type
    this.content = options.content
    this.priority = options.priority || 100
  }

  createDecoration(from: number, to: number, doc: Node, decos: DecorationSet) {
    const textContent = textBetween(from, to, doc)

    return textContent.reduce((decorations, currentPosition) => {
      return currentPosition.text.split('').reduce((innerDecorations, char, i) => {
        return this.test(char)
          ? innerDecorations.add(doc, [createDeco(currentPosition.pos + i, this.type, this.content)])
          : innerDecorations
      }, decorations)
    }, decos)
  }

  test(value: string) {
    return this.predicate(value)
  }
}
