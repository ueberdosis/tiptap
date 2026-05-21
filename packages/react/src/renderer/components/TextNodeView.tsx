/** @jsxImportSource react */

/**
 * Renders a ProseMirror text node.
 *
 * React can't give us a ref to a raw text node, so we wrap the text
 * in a `<span>` and point `nodeDOM` at the text node inside. This
 * adds an extra DOM element compared to plain ProseMirror — we'll
 * remove it later when we route decorated text through marks.
 */

import type { Node as PMNode } from '@tiptap/pm/model'
import { DecorationSet } from '@tiptap/pm/view'
import { useRef } from 'react'

import { useTextViewDescription } from '../hooks/useTextViewDescription.js'
import type { DOMNode } from '../viewdesc/index.js'

export function TextNodeView(props: { node: PMNode; index: number }) {
  const { node, index } = props
  const spanRef = useRef<HTMLSpanElement>(null)
  const textDOMRef = useRef<DOMNode | null>(null)

  useTextViewDescription({
    node,
    outerDeco: [],
    innerDeco: DecorationSet.empty,
    domRef: spanRef,
    nodeDOMRef: textDOMRef,
    index,
  })

  return (
    <span
      ref={el => {
        spanRef.current = el
        textDOMRef.current = el?.firstChild ?? null
      }}
    >
      {node.text}
    </span>
  )
}
