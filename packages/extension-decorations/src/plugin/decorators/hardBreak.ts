import { DecoratorNode } from '../DecoratorNode'

export class HardBreakDecorator extends DecoratorNode {
  constructor() {
    super({
      type: 'break',
      predicate: node => node.type === node.type.schema.nodes.hardBreak,
    })
  }
}
