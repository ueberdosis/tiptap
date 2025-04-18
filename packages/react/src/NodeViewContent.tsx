import type { ComponentProps } from 'react'
import React from 'react'

import { useReactNodeView } from './useReactNodeView.js'

export type NodeViewContentProps<T extends keyof React.JSX.IntrinsicElements = 'div'> = {
  as?: NoInfer<T>
} & ComponentProps<T>

export function NodeViewContent<T extends keyof React.JSX.IntrinsicElements = 'div'>({
  as: Tag = 'div' as T,
  ...props
}: NodeViewContentProps<T>) {
  const { nodeViewContentRef, nodeViewContentChildren } = useReactNodeView()

  return (
    // @ts-ignore
    <Tag
      {...props}
      ref={nodeViewContentRef}
      data-node-view-content=""
      style={{
        whiteSpace: 'pre-wrap',
        ...props.style,
      }}
    >
      {nodeViewContentChildren}
    </Tag>
  )
}
