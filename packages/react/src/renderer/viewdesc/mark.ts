/** One descriptor per applied mark. */

import type { Mark } from '@tiptap/pm/model'
import type { MarkView as PMMarkView } from '@tiptap/pm/view'

import { ReactViewDesc } from './base.js'
import { type DOMNode, NODE_DIRTY } from './types.js'

export class ReactMarkViewDesc extends ReactViewDesc {
  constructor(
    parent: ReactViewDesc | undefined,
    children: ReactViewDesc[],
    public readonly mark: Mark,
    dom: DOMNode,
    contentDOM: HTMLElement,
    public readonly spec?: PMMarkView,
  ) {
    super(parent, children, dom, contentDOM)
  }

  override matchesMark(mark: Mark): boolean {
    return this.dirty !== NODE_DIRTY && this.mark.eq(mark)
  }
}
