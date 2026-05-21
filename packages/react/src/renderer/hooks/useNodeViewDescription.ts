/**
 * Hook used by a `<NodeView>` React component to create + maintain
 * its `ReactNodeViewDesc` and register it with its parent.
 *
 * The desc is created lazily on the first commit (refs aren't filled
 * during render). On later commits its fields get mutated in place
 * so the instance — and its `pmViewDesc` back-pointer — stays stable.
 */

import type { Node as PMNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource } from '@tiptap/pm/view'
import type { RefObject } from 'react'
import { useContext, useRef } from 'react'

import type { ChildDescriptionsContextValue } from '../contexts/ChildDescriptionsContext.js'
import { ChildDescriptionsContext } from '../contexts/ChildDescriptionsContext.js'
import type { DOMNode } from '../viewdesc/index.js'
import { ReactNodeViewDesc } from '../viewdesc/index.js'
import { useChildDescriptions } from './useChildDescriptions.js'
import { useClientLayoutEffect } from './useClientLayoutEffect.js'

export interface UseNodeViewDescriptionInput {
  node: PMNode
  outerDeco: readonly Decoration[]
  innerDeco: DecorationSource
  /** Wrapping DOM element of the node view. */
  domRef: RefObject<HTMLElement | null>
  /** Element holding child content. Omit for leaves. */
  contentDOMRef?: RefObject<HTMLElement | null>
  /** Element PM treats as the node's own DOM. Defaults to `domRef`. */
  nodeDOMRef?: RefObject<DOMNode | null>
  /** Sibling slot in the parent's children list. */
  index: number
}

export interface UseNodeViewDescriptionResult {
  /** Forward to `<ChildDescriptionsContext.Provider value={...}>`. */
  childContext: ChildDescriptionsContextValue
  /** The desc, or `null` until the first commit has run. */
  descRef: RefObject<ReactNodeViewDesc | null>
}

export function useNodeViewDescription(input: UseNodeViewDescriptionInput): UseNodeViewDescriptionResult {
  const { node, outerDeco, innerDeco, domRef, contentDOMRef, nodeDOMRef, index } = input

  const parent = useContext(ChildDescriptionsContext)
  const { childrenRef, value: childContext } = useChildDescriptions()
  const descRef = useRef<ReactNodeViewDesc | null>(null)

  // Every commit: create-or-update the desc, then register with parent.
  // `addChild` is idempotent, so re-running per commit is fine.
  useClientLayoutEffect(() => {
    const dom = domRef.current
    if (!dom) {
      return
    }
    const contentDOM = contentDOMRef?.current ?? null
    const nodeDOM = nodeDOMRef?.current ?? dom

    let desc = descRef.current
    if (!desc) {
      desc = new ReactNodeViewDesc(undefined, childrenRef.current, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM)
      descRef.current = desc
    } else {
      desc.node = node
      desc.outerDeco = outerDeco
      desc.innerDeco = innerDeco
      desc.dom = dom
      desc.contentDOM = contentDOM
      desc.nodeDOM = nodeDOM
      desc.children = childrenRef.current
      dom.pmViewDesc = desc
    }

    // Layout effects fire bottom-up, so children may have already
    // registered themselves without a `parent`. Back-fill it now.
    for (let i = 0; i < childrenRef.current.length; i += 1) {
      childrenRef.current[i]!.parent = desc
    }

    parent.addChild(desc, index)
  })

  // Unmount: leave the parent's list and tear down the desc.
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

  return { childContext, descRef }
}
