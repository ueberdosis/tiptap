import type { Mark } from '@tiptap/pm/model'
import type { RefObject } from 'react'
import { useLayoutEffect, useRef } from 'react'

import { MarkViewDesc, NOT_DIRTY } from '../viewdesc.js'
import { useDescCleanup } from './useDescCleanup.js'

/**
 * Keeps a mark's desc registered against its rendered element. The parent
 * node's child walk rebuilds the desc's children and reparents it.
 */
export const useMarkViewDesc = (
  mark: Mark,
  domRef: RefObject<Element | null>,
  contentRef: RefObject<HTMLElement | null>,
): void => {
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

  useDescCleanup(descRef)
}
