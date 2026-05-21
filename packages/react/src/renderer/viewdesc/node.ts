/** Standard node descriptor. */

import type { Node as PMNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource } from '@tiptap/pm/view'

import { ReactViewDesc } from './base.js'
import type { DOMNode } from './types.js'

export class ReactNodeViewDesc extends ReactViewDesc {
  constructor(
    parent: ReactViewDesc | undefined,
    children: ReactViewDesc[],
    public override node: PMNode,
    public outerDeco: readonly Decoration[],
    public innerDeco: DecorationSource,
    dom: DOMNode,
    contentDOM: HTMLElement | null,
    /** DOM element PM treats as the node's own element (often === dom). */
    public nodeDOM: DOMNode,
  ) {
    super(parent, children, dom, contentDOM)
  }

  override get border(): number {
    return this.node.isLeaf ? 0 : 1
  }

  override get size(): number {
    return this.node.nodeSize
  }

  override get domAtom(): boolean {
    return this.node.isAtom
  }
}
