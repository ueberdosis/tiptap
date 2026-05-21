/** Adapter for third-party `NodeViewConstructor`s. */

import type { Node as PMNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource, NodeView as PMNodeView } from '@tiptap/pm/view'

import type { ReactViewDesc } from './base.js'
import { ReactNodeViewDesc } from './node.js'
import type { DOMNode } from './types.js'

export class ReactCustomNodeViewDesc extends ReactNodeViewDesc {
  constructor(
    parent: ReactViewDesc | undefined,
    children: ReactViewDesc[],
    node: PMNode,
    outerDeco: readonly Decoration[],
    innerDeco: DecorationSource,
    dom: DOMNode,
    contentDOM: HTMLElement | null,
    nodeDOM: DOMNode,
    public readonly spec: PMNodeView,
  ) {
    super(parent, children, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM)
  }
}
