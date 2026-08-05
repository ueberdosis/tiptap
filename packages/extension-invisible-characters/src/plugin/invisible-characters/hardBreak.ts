import { InvisibleNode } from '../InvisibleNode.js'

/**
 * Marks a hard break.
 */
export class HardBreakNode extends InvisibleNode {
  constructor() {
    super({
      type: 'break',
      predicate: node => node.type === node.type.schema.nodes.hardBreak,
    })
  }
}

export default HardBreakNode
