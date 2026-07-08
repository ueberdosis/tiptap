/** @jsxImportSource react */
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Decoration } from '@tiptap/pm/view'
import { DecorationSet } from '@tiptap/pm/view'
import type { ReactNode } from 'react'
import { createElement, useLayoutEffect, useRef } from 'react'

import { computeTextDecoLevels } from '../decorations/outerDeco.js'
import { useDescCleanup } from '../hooks/useDescCleanup.js'
import { attributesToProps } from '../props.js'
import { NOT_DIRTY, TextViewDesc } from '../viewdesc.js'

export interface DecoratedTextProps {
  /** The (possibly sliced) text node being rendered. */
  slice: ProseMirrorNode
  /** The inline decorations covering the run — must be non-empty. */
  deco: readonly Decoration[]
}

/** The rendered structure is wrappers all the way down to one text node. */
const findTextNode = (dom: Node): Node | null => {
  let current: Node | null = dom

  while (current && current.nodeType !== Node.TEXT_NODE) {
    current = current.firstChild
  }
  return current
}

interface RefreshTextDescOptions {
  existing: TextViewDesc | undefined
  slice: ProseMirrorNode
  deco: readonly Decoration[]
  dom: Node
  textDOM: Node
}

/** Refreshes the run's desc in place, or replaces it when the DOM moved. */
const refreshTextDesc = ({
  existing,
  slice,
  deco,
  dom,
  textDOM,
}: RefreshTextDescOptions): TextViewDesc => {
  if (existing && existing.dom === dom && existing.nodeDOM === textDOM) {
    existing.node = slice
    existing.outerDeco = deco
    existing.dirty = NOT_DIRTY
    dom.pmViewDesc = existing
    return existing
  }
  if (existing && existing.dom.pmViewDesc === existing) {
    existing.dom.pmViewDesc = undefined
  }
  return new TextViewDesc(undefined, slice, deco, DecorationSet.empty, dom, textDOM)
}

/**
 * A text run covered by inline decorations, wrapped in the decoration's
 * elements (nested spans, plus one level per `nodeName` decoration). The
 * run's `TextViewDesc` registers on the outermost wrapper with the real DOM
 * text node as `nodeDOM`, exactly like prosemirror-view's outer-decorated
 * text — mapping and offsets are preserved.
 */
export function DecoratedText({ slice, deco }: DecoratedTextProps): ReactNode {
  const domRef = useRef<HTMLElement | null>(null)
  const descRef = useRef<TextViewDesc | undefined>(undefined)

  useLayoutEffect(() => {
    const dom = domRef.current
    const textDOM = dom && findTextNode(dom)

    if (dom && textDOM) {
      descRef.current = refreshTextDesc({ existing: descRef.current, slice, deco, dom, textDOM })
    }
  })

  useDescCleanup(descRef)

  const levels = computeTextDecoLevels(deco)
  let content: ReactNode = slice.text

  levels.forEach((level, index) => {
    const isOutermost = index === levels.length - 1

    content = createElement(
      level.nodeName,
      { ...attributesToProps(level.attrs), ...(isOutermost ? { ref: domRef } : {}) },
      content,
    )
  })
  return content
}
