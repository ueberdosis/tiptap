import { DecoratorNode } from '../DecoratorNode'

export class ParagraphDecorator extends DecoratorNode {
  constructor() {
    super({
      type: 'paragraph',
      predicate: node => node.type === node.type.schema.nodes.paragraph,
    })
  }
}
