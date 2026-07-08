import type { NodeViewComponentProps } from '@tiptap/react-experimental'
import React, { useRef, useState } from 'react'

/**
 * A resizable image as a plain React component: no imperative node view, no
 * wrapper element beyond the component's own DOM. During the drag the size
 * lives in React state; releasing commits it to the node's attributes.
 */
export default (props: NodeViewComponentProps<HTMLDivElement>) => {
  const { node, selected, updateAttributes } = props
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [liveWidth, setLiveWidth] = useState<number | null>(null)

  const startResize = (event: React.PointerEvent) => {
    const img = imgRef.current

    if (!img) {
      return
    }
    event.preventDefault()

    const startX = event.clientX
    const startWidth = img.offsetWidth
    const aspectRatio = img.offsetWidth / img.offsetHeight
    let width = startWidth

    const onMove = (move: PointerEvent) => {
      width = Math.max(80, startWidth + (move.clientX - startX))
      setLiveWidth(width)
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      setLiveWidth(null)
      updateAttributes({
        width: Math.round(width),
        height: Math.round(width / aspectRatio),
      })
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const width = liveWidth ?? (node.attrs.width as number | null) ?? undefined
  const height = liveWidth ? undefined : ((node.attrs.height as number | null) ?? undefined)

  return (
    <div
      className={selected ? 'resizable-image is-selected' : 'resizable-image'}
      ref={props.ref}
      contentEditable={false}
    >
      <img
        ref={imgRef}
        src={node.attrs.src as string}
        alt={(node.attrs.alt as string) ?? ''}
        title={(node.attrs.title as string) ?? undefined}
        width={width}
        height={height}
        draggable={false}
      />
      <span className="resize-handle" data-test-id="resize-handle" onPointerDown={startResize} />
    </div>
  )
}
