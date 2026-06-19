import type { JSX } from 'solid-js'
import { splitProps } from 'solid-js'

import { useSolidNodeView } from './useSolidNodeView.jsx'

export type NodeViewWrapperProps = JSX.HTMLAttributes<HTMLDivElement> & {
  as?: string
}

export function NodeViewWrapper(props: NodeViewWrapperProps) {
  const [local, rest] = splitProps(props, ['as', 'class', 'classList'])
  const context = useSolidNodeView()

  return (
    <div
      classList={{
        ...(typeof local.classList === 'object' ? local.classList : {}),
        [context.decorationClasses ?? '']: Boolean(context.decorationClasses),
      }}
      class={[local.class, context.decorationClasses].filter(Boolean).join(' ')}
      style={{ 'white-space': 'normal' }}
      data-node-view-wrapper=""
      onDragStart={context.onDragStart}
      {...rest}
    />
  )
}
