import type { Node } from '@tiptap/pm/model'
import type { DecorationSet } from '@tiptap/pm/view'

import { createDecorationWidget } from './utils/create-decoration-widget.js'
import { textBetween } from './utils/text-between.js'

export interface InvisibleCharacterOptions {
  type: string
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
        if (!this.test(char)) {
          return innerDecorations
        }

        const decorationPosition = currentPosition.pos + i

        // Multi-step transactions can produce overlapping update ranges
        // remove any existing widget first to avoid duplicates
        const oldDecorationsAtPosition = innerDecorations.find(
          decorationPosition,
          decorationPosition,
          spec => spec.key === this.type,
        )

        return innerDecorations
          .remove(oldDecorationsAtPosition)
          .add(doc, [createDecorationWidget(decorationPosition, this.type, this.content)])
      }, oldDecorations)
    }, decorations)
  }

  test(value: string) {
    return this.predicate(value)
  }
}

export default InvisibleCharacter
