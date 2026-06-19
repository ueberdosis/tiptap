import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'

import { useSolidNodeView } from './useSolidNodeView.jsx'

export type NodeViewContentProps = JSX.HTMLAttributes<HTMLDivElement> & {
  as?: string
}

export function NodeViewContent(props: NodeViewContentProps) {
  const context = useSolidNodeView()
  const [, rest] = splitProps(props, ['as'])

  return (
    <div
      ref={el => context.nodeViewContentRef?.(el ?? undefined)}
      style={{ 'white-space': 'pre-wrap' }}
      data-node-view-content=""
      {...rest}
    />
  )
}
