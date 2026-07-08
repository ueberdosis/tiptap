import type { NodeViewComponentProps } from '@tiptap/react-experimental'
import { useMergedRefs } from '@tiptap/react-experimental'
import React, { useRef, useState } from 'react'

const toCSSSize = (value: unknown): string =>
  typeof value === 'number' ? `${value}px` : ((value as string) ?? 'auto')

/**
 * A resizable block node as a plain React component: the node's content
 * renders as `children` inside the element carrying `contentDOMRef`, and the
 * corner handle resizes via pointer events — React state during the drag,
 * `updateAttributes` on release.
 */
export default (props: NodeViewComponentProps<HTMLDivElement>) => {
  const { node, selected, updateAttributes, children } = props
  const boxRef = useRef<HTMLDivElement | null>(null)
  const [liveSize, setLiveSize] = useState<{ width: number; height: number } | null>(null)

  const startResize = (event: React.PointerEvent) => {
    const box = boxRef.current

    if (!box) {
      return
    }
    event.preventDefault()

    const startX = event.clientX
    const startY = event.clientY
    const startWidth = box.offsetWidth
    const startHeight = box.offsetHeight
    let size = { width: startWidth, height: startHeight }

    const onMove = (move: PointerEvent) => {
      size = {
        width: Math.max(120, startWidth + (move.clientX - startX)),
        height: Math.max(60, startHeight + (move.clientY - startY)),
      }
      setLiveSize(size)
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      setLiveSize(null)
      updateAttributes({ width: size.width, height: size.height })
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const width = liveSize ? `${liveSize.width}px` : toCSSSize(node.attrs.width)
  const height = liveSize ? `${liveSize.height}px` : toCSSSize(node.attrs.height)

  return (
    <div
      data-resizer=""
      className={selected ? 'resizable-node is-selected' : 'resizable-node'}
      ref={useMergedRefs(props.ref, boxRef)}
      style={{ width, height }}
    >
      <label contentEditable={false}>
        Width: {width}, Height: {height}
      </label>
      <div className="resizable-node-content" ref={props.contentDOMRef}>
        {children}
      </div>
      <span className="resize-handle" data-test-id="resize-handle" onPointerDown={startResize} />
    </div>
  )
}
