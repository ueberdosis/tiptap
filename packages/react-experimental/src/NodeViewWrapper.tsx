/** @jsxImportSource react */
import type { CSSProperties } from 'react'
import React from 'react'

import { useMergedRefs } from './refs.js'
import { useReactNodeView } from './useReactNodeView.js'

export interface NodeViewWrapperProps {
  [key: string]: any
  as?: React.ElementType
}

/**
 * The node view's root element, with the `@tiptap/react` API. Under this
 * renderer the wrapper element IS the node view's DOM: the renderer's
 * wrapper ref (provided over context by `ReactNodeViewRenderer`'s host)
 * receives it directly, and the host's `className`/`attrs` options land
 * here as extra props.
 */
export const NodeViewWrapper: React.FC<NodeViewWrapperProps> = React.forwardRef((props, ref) => {
  const { onDragStart, nodeViewWrapperRef, nodeViewWrapperProps, nodeViewWrapperAs } =
    useReactNodeView()
  const { as, className, style, ...rest } = props
  const Tag = as || nodeViewWrapperAs || 'div'
  const { className: extraClassName, style: extraStyle, ...extraProps } = nodeViewWrapperProps ?? {}
  const mergedClassName = [extraClassName, className].filter(Boolean).join(' ') || undefined
  const mergedRef = useMergedRefs(ref, nodeViewWrapperRef)

  return (
    // @ts-ignore
    <Tag
      {...extraProps}
      {...rest}
      className={mergedClassName}
      ref={mergedRef}
      data-node-view-wrapper=""
      onDragStart={onDragStart}
      style={{
        whiteSpace: 'normal',
        ...(extraStyle as CSSProperties | undefined),
        ...style,
      }}
    />
  )
})
