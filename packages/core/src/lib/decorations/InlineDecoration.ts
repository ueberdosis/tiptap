import { Decoration as PMDecoration, DecorationAttrs } from '@tiptap/pm/view'

import { Decoration } from './Decoration.js'

export class InlineDecoration extends Decoration {
  to: number

  attrs: DecorationAttrs = {}

  get from() {
    return this.pos
  }

  constructor(from: number, to: number, attributes?: DecorationAttrs) {
    super(from)
    this.to = to

    this.attrs = {
      ...this.attrs,
      ...attributes,
    }
  }

  toProsemirrorDecoration(): PMDecoration {
    return PMDecoration.inline(this.from, this.to, this.attrs)
  }

  static create(options: {
    from: number;
    to: number;
    attributes?: DecorationAttrs;
  }) {
    const dec = new InlineDecoration(options.from, options.to, options.attributes)

    return dec
  }
}
