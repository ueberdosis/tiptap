import { Node, NodeRange, ResolvedPos } from '@tiptap/pm/model'

export class NodePosition {
  /**
   * The node inside this node position
   */
  node: Node

  /**
   * The resolved position of this node position
   */
  $pos: ResolvedPos

  /**
   * The document node
   */
  doc: Node

  /**
   * The depth of this position
   */
  depth

  constructor($pos: ResolvedPos) {
    this.$pos = $pos
    this.depth = Math.max(this.$pos.depth, 0)
    this.node = $pos.node(this.depth)
    this.doc = $pos.doc
  }

  /**
   * The node name
   */
  get name() {
    return this.node?.type.name
  }

  /**
   * The start position of this node
   */
  get from() {
    if (this.name === 'doc') { return 0 }

    return this.$pos.start() - 1
  }

  /**
   * The end position of this node
   */
  get to() {
    if (this.name === 'doc') { return this.$pos.end() + 2 }

    return this.$pos.end() + 1
  }

  /**
   * Retrieves the NodePosition before this NodePosition
   */
  get before(): NodePosition | null {
    let nodePos: NodePosition | null | undefined

    for (let i = this.depth; i > 0 && nodePos === undefined; i -= 1) {
      const before = Math.max(this.$pos.before(i) - 2, 0)
      const $beforePos = this.doc.resolve(before)

      if ($beforePos.node().type.name !== 'doc') {
        nodePos = new NodePosition($beforePos)
      }
    }

    if (!nodePos) {
      return null
    }

    return nodePos
  }

  /**
   * Retrieves the NodePosition after this NodePosition
   */
  get after(): NodePosition | null {
    let nodePos: NodePosition | null | undefined

    for (let i = this.depth; i > 0 && nodePos === undefined; i -= 1) {
      const after = Math.min(this.$pos.after(i) + 2, this.doc.nodeSize - 2)
      const $afterPos = this.doc.resolve(after)

      if ($afterPos.node().type.name !== 'doc') {
        nodePos = new NodePosition($afterPos)
      }
    }

    if (!nodePos) {
      return null
    }

    return nodePos
  }

  /**
   * Retrieves the parent NodePosition of this NodePosition
   */
  get parent(): NodePosition | null {
    const parentDepth = Math.max(this.depth - 1, 0)
    const parentPos = Math.min(Math.max(this.$pos.posAtIndex(0, parentDepth), 0), this.doc.nodeSize - 2)

    if (parentPos === 0) {
      return null
    }

    const $parentPos = this.doc.resolve(parentPos)

    return new NodePosition($parentPos)
  }

  /**
   * Returns the range of this NodePosition
   */
  get range() {
    return { from: this.from, to: this.to }
  }

  /**
   * Create a NodeRange for this NodePosition
   * @returns NodeRange
   */
  createNodeRange() {
    return new NodeRange(this.doc.resolve(this.from), this.doc.resolve(this.to), this.depth)
  }

  getParentByType(typeOrName: string) {
    return NodePosition.getNodePositionParentByType(this, typeOrName)
  }

  hasParentByType(typeOrName: string) {
    return NodePosition.hasParentByType(this, typeOrName)
  }

  static hasParentByType(position: NodePosition, typeOrName: string) {
    return NodePosition.getNodePositionParentByType(position, typeOrName) !== null
  }

  static getNodePositionParentByType(position: NodePosition, typeOrName: string): NodePosition | null {
    if (position.depth <= 1 || !position.parent) {
      return null
    }

    if (position.parent.name !== typeOrName && position.depth >= 1) {
      return NodePosition.getNodePositionParentByType(position.parent, typeOrName)
    }

    return position.parent
  }
}
