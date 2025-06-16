import { Node } from '@tiptap/pm/model'
import { DecorationSet } from '@tiptap/pm/view'

import { createDecorationWidget } from './utils/create-decoration-widget.js'
import { textBetween } from './utils/text-between.js'

export interface InvisibleCharacterOptions {
  type: string;
  predicate: (value: string) => boolean
  priority?: number
  content?: string
}

export class InvisibleCharacter {
  predicate: (value: string) => boolean

  content?: string

  type: string

  priority: number

  constructor(options: InvisibleCharacterOptions) {
    this.predicate = options.predicate
    this.type = options.type
    this.content = options.content
    this.priority = options.priority || 100
  }

  createDecoration(from: number, to: number, doc: Node, decorations: DecorationSet) {
    const textContent = textBetween(from, to, doc)

    return textContent.reduce((oldDecorations, currentPosition) => {
      return currentPosition.text.split('').reduce((innerDecorations, char, i) => {
        return this.test(char)
          ? innerDecorations.add(doc, [createDecorationWidget(currentPosition.pos + i, this.type, this.content)])
          : innerDecorations
      }, oldDecorations)
    }, decorations)
  }

  test(value: string) {
    return this.predicate(value)
  }
}

export default InvisibleCharacter
