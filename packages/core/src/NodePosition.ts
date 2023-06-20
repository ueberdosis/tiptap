import { Node, ResolvedPos } from 'prosemirror-model'

export class NodePosition {
  node: Node

  $pos: ResolvedPos

  doc: Node

  depth

  constructor($pos: ResolvedPos, depthOffset = 0) {
    this.$pos = $pos
    this.depth = Math.max(this.$pos.depth - depthOffset)
    this.node = $pos.node(this.depth)
    this.doc = $pos.doc
  }

  get name() {
    return this.node?.type.name
  }

  get from() {
    if (this.name === 'doc') { return 0 }

    return this.$pos.start() - 1
  }

  get to() {
    if (this.name === 'doc') { return this.$pos.end() + 2 }

    return this.$pos.end() + 1
  }

  get before(): NodePosition | null {
    const $beforePos = this.doc.resolve(Math.max(this.from - 2, 0))

    const nodePos = new NodePosition($beforePos)

    if (nodePos.name === 'doc') {
      return null
    }

    return nodePos
  }

  get after(): NodePosition | null {
    const $afterPos = this.doc.resolve(Math.min(this.to + 2, this.doc.nodeSize - 2))

    const nodePos = new NodePosition($afterPos)

    if (nodePos.name === 'doc') {
      return null
    }

    return nodePos
  }

  get parent(): NodePosition | null {
    const $parentPos = this.doc.resolve(Math.max(this.from, 0))

    return new NodePosition($parentPos, -1)
  }

  get range() {
    return { from: this.from, to: this.to }
  }
}
