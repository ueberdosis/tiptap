/** @jsxImportSource react */
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { ReactNode } from 'react'
import { useLayoutEffect, useRef } from 'react'

import { TrailingHackViewDesc } from '../viewdesc.js'

/**
 * Whether a node needs the contenteditable trailing `<br>`: empty
 * textblocks (otherwise rendered at zero height and untargetable) and
 * textblocks whose visible content ends in a line break.
 */
export const needsTrailingHack = (node: ProseMirrorNode): boolean => {
  if (!node.isTextblock) {
    return false
  }

  const last = node.lastChild

  return !last || !last.isText || (last.text ?? '').endsWith('\n')
}

/**
 * The trailing-break hack as React: a `<br>` described by a zero-size desc
 * so position mapping skips over it.
 */
export function TrailingHackView(): ReactNode {
  const domRef = useRef<HTMLBRElement | null>(null)

  useLayoutEffect(() => {
    const dom = domRef.current

    if (dom && !(dom.pmViewDesc instanceof TrailingHackViewDesc)) {
      // The desc registers itself on the expando; the parent's child walk
      // picks it up
      void new TrailingHackViewDesc(undefined, [], dom, null)
    }
  })

  useLayoutEffect(
    () => () => {
      const dom = domRef.current

      if (dom?.pmViewDesc instanceof TrailingHackViewDesc) {
        dom.pmViewDesc = undefined
      }
    },
    [],
  )

  return <br ref={domRef} />
}
