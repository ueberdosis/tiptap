import type { Node } from '@tiptap/pm/model'
import type { DecorationSet } from '@tiptap/pm/view'

import { createDecorationWidget } from './utils/create-decoration-widget.js'
import { textBetween } from './utils/text-between.js'

/**
 * Options for one `InvisibleCharacter`.
 */
export interface InvisibleCharacterOptions {
  /**
   * Name of the character, used as the CSS class of the marker.
   */
  type: string

  /**
   * Whether this character should be marked.
   */
  predicate: (value: string) => boolean

  /**
   * Which marker wins when two of them match the same spot. Higher goes first.
   */
  priority?: number

  /**
   * Text shown in the marker.
   */
  content?: string
}

/**
 * Marks a single character, such as a space, wherever it appears in the text.
 */
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
          ? innerDecorations.add(doc, [
              createDecorationWidget(currentPosition.pos + i, this.type, this.content),
            ])
          : innerDecorations
      }, oldDecorations)
    }, decorations)
  }

  test(value: string) {
    return this.predicate(value)
  }
}

export default InvisibleCharacter
