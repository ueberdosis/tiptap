import type { Node as PMNode } from '@tiptap/pm/model'
import type { DecorationSet } from '@tiptap/pm/view'

import { createDecorationWidget } from './utils/create-decoration-widget.js'

export interface InvisibleNodeOptions {
  content?: string
  position?: (node: PMNode, pos: number) => number
  predicate: (value: PMNode) => boolean
  priority?: number
  type: string
}

/** Default position for nodes is always at the end of the node */
const defaultPosition = (node: PMNode, pos: number) => pos + node.nodeSize - 1

export class InvisibleNode {
  predicate: (value: PMNode) => boolean

  position: (node: PMNode, pos: number) => number

  content?: string

  type: string

  priority: number

  constructor(options: InvisibleNodeOptions) {
    this.predicate = options.predicate
    this.type = options.type
    this.position = options.position || defaultPosition
    this.content = options.content
    this.priority = options.priority || 100
  }

  createDecoration(from: number, to: number, doc: PMNode, decorations: DecorationSet) {
    let newDecorations = decorations

    doc.nodesBetween(from, to, (node, pos) => {
      if (this.test(node)) {
        const decorationPosition = this.position(node, pos)
        const oldDecorations = newDecorations.find(
          decorationPosition,
          decorationPosition,
          spec => spec.key === this.type,
        )

        newDecorations = newDecorations
          .remove(oldDecorations)
          .add(doc, [createDecorationWidget(decorationPosition, this.type, this.content)])
      }
    })
    return newDecorations
  }

  test(value: PMNode) {
    return this.predicate(value)
  }
}

export default InvisibleNode
