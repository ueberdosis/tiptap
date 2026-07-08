/**
 * Derived from prosemirror-view's `src/viewdesc.ts` `computeOuterDeco()`
 * (MIT, Copyright (C) 2015-2017 by Marijn Haverbeke and others), split into
 * the two React shapes: wrap levels around text nodes, and attribute merges
 * onto rendered elements. Semantics track the pinned 1.41.9.
 */
import type { Decoration } from '@tiptap/pm/view'

import { decorationAttrs } from './internals.js'

export interface TextDecoLevel {
  nodeName: string
  attrs: Record<string, string>
}

const mergeAttr = (target: Record<string, string>, name: string, value: string): void => {
  if (name === 'class') {
    target.class = target.class ? `${target.class} ${value}` : value
  } else if (name === 'style') {
    target.style = target.style ? `${target.style};${value}` : value
  } else if (name !== 'nodeName') {
    target[name] = value
  }
}

/**
 * The wrapper elements a decorated text node renders into, innermost first.
 * Attribute-only decorations share one span; each `nodeName` decoration adds
 * its own level.
 */
export const computeTextDecoLevels = (deco: readonly Decoration[]): TextDecoLevel[] => {
  const levels: TextDecoLevel[] = []
  let top: TextDecoLevel | null = null

  deco.forEach(decoration => {
    const attrs = decorationAttrs(decoration)

    if (attrs.nodeName) {
      top = { nodeName: String(attrs.nodeName), attrs: {} }
      levels.push(top)
    }
    Object.entries(attrs).forEach(([name, value]) => {
      if (value === null || value === undefined) {
        return
      }
      if (!top) {
        // Text nodes cannot carry attributes; the first one forces a span
        top = { nodeName: 'span', attrs: {} }
        levels.push(top)
      }
      mergeAttr(top.attrs, name, String(value))
    })
  })
  return levels
}

/**
 * The merged attributes decorations contribute to an element (class and
 * style concatenate, other attributes last-write-wins). `nodeName`
 * decorations on elements are not supported by the React renderer — the
 * attrs still apply, the rename is ignored.
 */
export const mergeElementDecoAttrs = (deco: readonly Decoration[]): Record<string, string> => {
  const merged: Record<string, string> = {}

  deco.forEach(decoration => {
    Object.entries(decorationAttrs(decoration)).forEach(([name, value]) => {
      if (value !== null && value !== undefined) {
        mergeAttr(merged, name, String(value))
      }
    })
  })
  return merged
}
