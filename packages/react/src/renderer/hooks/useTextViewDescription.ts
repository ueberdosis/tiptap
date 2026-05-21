/**
 * Text-node variant of {@link useNodeViewDescription}.
 *
 * Same lifecycle dance, but creates a `ReactTextViewDesc` (no
 * `contentDOM`, separate `nodeDOM` pointing at the actual text node).
 */

import type { Node as PMNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource } from '@tiptap/pm/view'
import type { RefObject } from 'react'
import { useContext, useRef } from 'react'

import type { ChildDescriptionsContextValue } from '../contexts/ChildDescriptionsContext.js'
import { ChildDescriptionsContext } from '../contexts/ChildDescriptionsContext.js'
import type { DOMNode } from '../viewdesc/index.js'
import { ReactTextViewDesc } from '../viewdesc/index.js'
import { useClientLayoutEffect } from './useClientLayoutEffect.js'

export interface UseTextViewDescriptionInput {
  node: PMNode
  outerDeco: readonly Decoration[]
  innerDeco: DecorationSource
  /** Wrapping DOM element (often a `<span>`). */
  domRef: RefObject<HTMLElement | null>
  /** The actual text DOM node inside the wrapper. */
  nodeDOMRef: RefObject<DOMNode | null>
  index: number
}

export interface UseTextViewDescriptionResult {
  /** Forward to `<ChildDescriptionsContext.Provider value={...}>`. */
  childContext: ChildDescriptionsContextValue
  descRef: RefObject<ReactTextViewDesc | null>
}

export function useTextViewDescription(input: UseTextViewDescriptionInput): UseTextViewDescriptionResult {
  const { node, outerDeco, innerDeco, domRef, nodeDOMRef, index } = input

  const parent = useContext(ChildDescriptionsContext)
  const descRef = useRef<ReactTextViewDesc | null>(null)

  useClientLayoutEffect(() => {
    const dom = domRef.current
    const nodeDOM = nodeDOMRef.current
    if (!dom || !nodeDOM) {
      return
    }

    let desc = descRef.current
    if (!desc) {
      desc = new ReactTextViewDesc(undefined, node, outerDeco, innerDeco, dom, nodeDOM)
      descRef.current = desc
    } else {
      desc.node = node
      desc.outerDeco = outerDeco
      desc.innerDeco = innerDeco
      desc.dom = dom
      desc.nodeDOM = nodeDOM
      dom.pmViewDesc = desc
    }

    parent.addChild(desc, index)
  })

  useClientLayoutEffect(() => {
    return () => {
      const desc = descRef.current
      if (!desc) {
        return
      }
      parent.removeChild(desc)
      desc.destroy()
      descRef.current = null
    }
  }, [parent])

  // Text descs have no children but the context still needs to be threaded
  // through; we hand back the parent's value unchanged.
  return { childContext: parent, descRef }
}
