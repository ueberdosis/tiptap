import { Decoration as PMDecoration, DecorationAttrs } from '@tiptap/pm/view'

import { Decoration } from './Decoration.js'

export class NodeDecoration extends Decoration {
  to: number

  attrs: DecorationAttrs = {}

  spec?: any

  get from() {
    return this.pos
  }

  constructor(from: number, to: number, attributes?: DecorationAttrs, spec?: any) {
    super(from)
    this.to = to

    this.attrs = {
      ...this.attrs,
      ...attributes,
    }

    this.spec = spec
  }

  toProsemirrorDecoration(): PMDecoration {
    return PMDecoration.node(this.from, this.to, this.attrs, this.spec)
  }

  static create(options: {
    from: number;
    to: number;
    attributes?: DecorationAttrs;
    spec?: any;
  }) {
    const dec = new NodeDecoration(options.from, options.to, options.attributes, options.spec)

    return dec
  }
}
