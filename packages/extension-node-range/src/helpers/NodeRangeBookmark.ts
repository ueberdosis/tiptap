import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Mappable } from '@tiptap/pm/transform'

import { NodeRangeSelection } from './NodeRangeSelection.js'

export class NodeRangeBookmark {
  anchor!: number

  head!: number

  constructor(anchor: number, head: number) {
    this.anchor = anchor
    this.head = head
  }

  map(mapping: Mappable) {
    return new NodeRangeBookmark(mapping.map(this.anchor), mapping.map(this.head))
  }

  resolve(doc: ProseMirrorNode) {
    const $anchor = doc.resolve(this.anchor)
    const $head = doc.resolve(this.head)

    return new NodeRangeSelection($anchor, $head)
  }
}
