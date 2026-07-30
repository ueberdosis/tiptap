import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Mappable } from '@tiptap/pm/transform'

import { NodeRangeSelection } from './NodeRangeSelection.js'

export class NodeRangeBookmark {
  anchor!: number
  head!: number
  depth!: number

  constructor(anchor: number, head: number, depth: number | undefined) {
    this.anchor = anchor
    this.head = head
    this.depth = depth ?? 0
  }

  map(mapping: Mappable) {
    return new NodeRangeBookmark(mapping.map(this.anchor), mapping.map(this.head), this.depth)
  }

  resolve(doc: ProseMirrorNode) {
    const $anchor = doc.resolve(this.anchor)
    const $head = doc.resolve(this.head)

    return new NodeRangeSelection($anchor, $head, this.depth)
  }
}
