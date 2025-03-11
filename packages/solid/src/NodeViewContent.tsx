import { Dynamic } from 'solid-js/web'

import { useSolidNodeView } from './useSolidNodeView.js'
import type { DomElement, DomElementAsProps } from './utils/types.js'

export type NodeViewContentProps<E extends DomElement = 'div'> = DomElementAsProps<E>

export function NodeViewContent<E extends DomElement = 'div'>(props: NodeViewContentProps<E>) {
  const context = useSolidNodeView()
  return (
    <Dynamic
      component={props.as || ('div' as any)}
      {...props}
      ref={context.nodeViewContentRef}
      data-node-view-content=""
      style={{
        whiteSpace: 'pre-wrap',
        ...props.style,
      }}
    >
      {context.nodeViewContentChildren}
    </Dynamic>
  )
}
