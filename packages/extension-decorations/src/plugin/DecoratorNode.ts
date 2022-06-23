import { Node } from 'prosemirror-model'
import { DecorationSet } from 'prosemirror-view'

import { createDeco } from './utils'

export interface DecoratorNodeOptions {
  content?: string
  position?: (node: Node, pos: number) => number;
  predicate: (value: Node) => boolean
  priority?: number
  type: string;
}

/** Default position for nodes is always at the end of the node */
const defaultPosition = (node: Node, pos: number) => pos + node.nodeSize - 1

export class DecoratorNode {
  predicate: (value: Node) => boolean

  position: (node: Node, pos: number) => number

  content ?: string

  type: string

  priority: number

  constructor(options: DecoratorNodeOptions) {
    this.predicate = options.predicate
    this.type = options.type
    this.position = options.position || defaultPosition
    this.content = options.content
    this.priority = options.priority || 100
  }

  createDecoration(from: number, to: number, doc: Node, decos: DecorationSet) {
    let newDecos = decos

    doc.nodesBetween(from, to, (node, pos) => {
      if (this.test(node)) {
        const decoPos = this.position(node, pos)
        const oldDecos = newDecos.find(
          decoPos,
          decoPos,
          spec => spec.key === this.type,
        )

        newDecos = newDecos
          .remove(oldDecos)
          .add(doc, [createDeco(decoPos, this.type, this.content)])
      }
    })
    return newDecos
  }

  test(value: Node) {
    return this.predicate(value)
  }
}
