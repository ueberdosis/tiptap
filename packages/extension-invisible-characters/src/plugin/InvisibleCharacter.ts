import type { Node as PMNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSet } from '@tiptap/pm/view'

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

  createDecoration(from: number, to: number, doc: PMNode, decorations: DecorationSet) {
    const widgets: Decoration[] = []

    textBetween(from, to, doc).forEach(({ pos, text }) => {
      text.split('').forEach((char, index) => {
        if (this.test(char)) {
          widgets.push(createDecorationWidget(pos + index, this.type, this.content))
        }
      })
    })

    // Overlapping update ranges would add the same widget twice
    const lastCharacterPosition = to - 1
    const existingWidgets = decorations.find(
      from,
      lastCharacterPosition,
      spec => spec.key === this.type,
    )

    return decorations.remove(existingWidgets).add(doc, widgets)
  }

  test(value: string) {
    return this.predicate(value)
  }
}

export default InvisibleCharacter
