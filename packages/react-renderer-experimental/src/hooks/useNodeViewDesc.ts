import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { RefObject } from 'react'
import { useLayoutEffect, useRef } from 'react'

import { detachNodeViewDesc, rebuildChildDescs, updateNodeViewDesc } from '../descriptors.js'
import type { NodeViewDesc } from '../viewdesc.js'

export interface UseNodeViewDescOptions {
  node: ProseMirrorNode
  domRef: RefObject<Element | null>
  /** Resolves the element holding rendered children, given the node's DOM. */
  getContentDOM: (dom: Element) => HTMLElement | null
  /** Called after each commit with the refreshed desc. */
  onUpdated?: (desc: NodeViewDesc) => void
}

/**
 * Keeps a node's `ViewDesc` registered against its React-rendered DOM. Runs
 * as a layout effect on every commit: children commit before parents, so the
 * child walk in `rebuildChildDescs` always sees refreshed child descs.
 */
export const useNodeViewDesc = ({
  node,
  domRef,
  getContentDOM,
  onUpdated,
}: UseNodeViewDescOptions): void => {
  const descRef = useRef<NodeViewDesc | undefined>(undefined)

  useLayoutEffect(() => {
    const dom = domRef.current

    if (!dom) {
      return
    }
    descRef.current = updateNodeViewDesc({
      desc: descRef.current,
      node,
      dom,
      contentDOM: getContentDOM(dom),
      nodeDOM: dom,
    })
    rebuildChildDescs(descRef.current)
    onUpdated?.(descRef.current)
  })

  useLayoutEffect(
    () => () => {
      if (descRef.current) {
        detachNodeViewDesc(descRef.current)
      }
    },
    [],
  )
}
