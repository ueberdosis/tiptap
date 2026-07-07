/** @jsxImportSource react */
import type { Mark } from '@tiptap/pm/model'
import type { ReactNode } from 'react'
import { useLayoutEffect, useRef } from 'react'

import { MarkViewDesc, NOT_DIRTY } from '../viewdesc.js'
import { renderOutputSpec } from './OutputSpecView.js'

export interface MarkViewProps {
  mark: Mark
  children?: ReactNode
}

/**
 * Renders a mark from its schema `toDOM` spec around a run of inline
 * content. A layout effect keeps the mark's desc registered against the
 * rendered element; the parent node's child walk rebuilds its children.
 */
export function MarkView({ mark, children }: MarkViewProps): ReactNode {
  const domRef = useRef<Element | null>(null)
  const contentRef = useRef<HTMLElement | null>(null)
  const descRef = useRef<MarkViewDesc | undefined>(undefined)

  useLayoutEffect(() => {
    const dom = domRef.current
    const contentDOM = contentRef.current

    if (!dom || !contentDOM) {
      return
    }

    const existing = descRef.current

    if (existing && existing.dom === dom) {
      existing.mark = mark
      existing.contentDOM = contentDOM
      existing.dirty = NOT_DIRTY
      dom.pmViewDesc = existing
      return
    }
    if (existing && existing.dom.pmViewDesc === existing) {
      existing.dom.pmViewDesc = undefined
    }
    descRef.current = new MarkViewDesc(undefined, mark, dom, contentDOM)
  })

  useLayoutEffect(
    () => () => {
      const desc = descRef.current

      if (desc && desc.dom.pmViewDesc === desc) {
        desc.dom.pmViewDesc = undefined
      }
    },
    [],
  )

  const spec = mark.type.spec.toDOM?.(mark, true)

  if (!spec) {
    throw new RangeError(
      `[tiptap error]: Mark type "${mark.type.name}" has no toDOM spec and no React mark view`,
    )
  }

  return renderOutputSpec(spec, { ref: domRef, contentRef, children })
}
