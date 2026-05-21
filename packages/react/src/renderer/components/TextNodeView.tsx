/** @jsxImportSource react */

/**
 * Renders a ProseMirror text node.
 *
 * The text is seeded into the DOM via JSX on first mount, then frozen
 * — subsequent re-renders use a layout effect to update `nodeValue`
 * imperatively, but only when the text actually differs from what's
 * already in the DOM. This avoids React clobbering the browser's
 * contentEditable selection during typing.
 */

import type { Node as PMNode } from '@tiptap/pm/model'
import { DecorationSet } from '@tiptap/pm/view'
import { useLayoutEffect, useRef } from 'react'

import { useTextViewDescription } from '../hooks/useTextViewDescription.js'
import type { DOMNode } from '../viewdesc/index.js'

export function TextNodeView(props: { node: PMNode; index: number }) {
  const { node, index } = props
  const spanRef = useRef<HTMLSpanElement>(null)
  const textDOMRef = useRef<DOMNode | null>(null)
  // Snapshot the initial text so React's reconciler never re-writes it.
  const initialText = useRef(node.text ?? '')

  useTextViewDescription({
    node,
    outerDeco: [],
    innerDeco: DecorationSet.empty,
    domRef: spanRef,
    nodeDOMRef: textDOMRef,
    index,
  })

  useLayoutEffect(() => {
    const span = spanRef.current
    if (!span) {
      return
    }
    const text = node.text ?? ''
    const textNode = span.firstChild as Text | null
    if (textNode && textNode.nodeValue !== text) {
      textNode.nodeValue = text
    }
    textDOMRef.current = span.firstChild ?? null
  })

  return (
    <span
      ref={el => {
        spanRef.current = el
        textDOMRef.current = el?.firstChild ?? null
      }}
    >
      {initialText.current}
    </span>
  )
}
