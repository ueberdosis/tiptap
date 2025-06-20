import { InvisibleNode } from '../InvisibleNode.js'

export class ParagraphNode extends InvisibleNode {
  constructor() {
    super({
      type: 'paragraph',
      predicate: node => node.type === node.type.schema.nodes.paragraph,
    })
  }
}

export default ParagraphNode
