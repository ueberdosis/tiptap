/**
 * Derived from prosemirror-view's `src/viewdesc.ts` `iterDeco()` (MIT,
 * Copyright (C) 2015-2017 by Marijn Haverbeke and others): walks a node's
 * children together with its local decorations, emitting widgets at their
 * positions (ordered by `side`) and splitting text children at decoration
 * boundaries. Semantics track the pinned prosemirror-view 1.41.9.
 */
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource } from '@tiptap/pm/view'

import { isInline, isWidget, sourceLocals, widgetSide } from './internals.js'

export type WidgetCallback = (widget: Decoration, index: number, insideNode: boolean) => void

export type NodeCallback = (
  node: ProseMirrorNode,
  outerDeco: readonly Decoration[],
  innerDeco: DecorationSource,
  /** Child index, or -1 for the continuation slices of a split text node. */
  index: number,
) => void

const compareSide = (a: Decoration, b: Decoration): number => widgetSide(a) - widgetSide(b)

export const iterDeco = (
  parent: ProseMirrorNode,
  deco: DecorationSource,
  onWidget: WidgetCallback,
  onNode: NodeCallback,
): void => {
  const locals = sourceLocals(deco, parent)
  let offset = 0

  // Simple, cheap variant for when there are no local decorations
  if (locals.length === 0) {
    for (let i = 0; i < parent.childCount; i += 1) {
      const child = parent.child(i)

      onNode(child, locals, deco.forChild(offset, child), i)
      offset += child.nodeSize
    }
    return
  }

  let decoIndex = 0
  const active: Decoration[] = []
  let restNode: ProseMirrorNode | null = null

  for (let parentIndex = 0; ; ) {
    const widgets: Decoration[] = []

    while (decoIndex < locals.length && locals[decoIndex].to === offset) {
      const next = locals[decoIndex]

      decoIndex += 1
      if (isWidget(next)) {
        widgets.push(next)
      }
    }
    if (widgets.length > 1) {
      widgets.sort(compareSide)
    }
    widgets.forEach(widget => onWidget(widget, parentIndex, Boolean(restNode)))

    let child: ProseMirrorNode
    let index: number

    if (restNode) {
      index = -1
      child = restNode
      restNode = null
    } else if (parentIndex < parent.childCount) {
      index = parentIndex
      child = parent.child(parentIndex)
      parentIndex += 1
    } else {
      break
    }

    for (let i = 0; i < active.length; i += 1) {
      if (active[i].to <= offset) {
        active.splice(i, 1)
        i -= 1
      }
    }
    while (
      decoIndex < locals.length &&
      locals[decoIndex].from <= offset &&
      locals[decoIndex].to > offset
    ) {
      active.push(locals[decoIndex])
      decoIndex += 1
    }

    let end = offset + child.nodeSize

    if (child.isText) {
      let cutAt = end

      if (decoIndex < locals.length && locals[decoIndex].from < cutAt) {
        cutAt = locals[decoIndex].from
      }
      active.forEach(span => {
        if (span.to < cutAt) {
          cutAt = span.to
        }
      })
      if (cutAt < end) {
        restNode = child.cut(cutAt - offset)
        child = child.cut(0, cutAt - offset)
        end = cutAt
        index = -1
      }
    } else {
      while (decoIndex < locals.length && locals[decoIndex].to < end) {
        decoIndex += 1
      }
    }

    const outerDeco =
      child.isInline && !child.isLeaf ? active.filter(span => !isInline(span)) : active.slice()

    onNode(child, outerDeco, deco.forChild(offset, child), index)
    offset = end
  }
}
