/** Text leaf descriptor. */

import type { Node as PMNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource } from '@tiptap/pm/view'

import type { ReactViewDesc } from './base.js'
import { ReactNodeViewDesc } from './node.js'
import type { DOMNode } from './types.js'

export class ReactTextViewDesc extends ReactNodeViewDesc {
  constructor(
    parent: ReactViewDesc | undefined,
    node: PMNode,
    outerDeco: readonly Decoration[],
    innerDeco: DecorationSource,
    dom: DOMNode,
    nodeDOM: DOMNode,
  ) {
    super(parent, [], node, outerDeco, innerDeco, dom, null, nodeDOM)
  }

  override isText(text: string): boolean {
    return this.node.text === text
  }

  override localPosFromDOM(dom: DOMNode, offset: number, bias: number): number {
    if (dom === this.nodeDOM) {
      return this.posAtStart + Math.min(offset, this.node.text!.length)
    }
    return super.localPosFromDOM(dom, offset, bias)
  }

  override domFromPos(pos: number, _side: number): { node: DOMNode; offset: number } {
    return { node: this.nodeDOM, offset: pos }
  }

  override get domAtom(): boolean {
    return false
  }
}
