import type { Ref } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { useSolidNodeView } from './useSolidNodeView.js'
import type { DomElement, DomElementAsProps, DomElementRef } from './utils/types.js'

export type NodeViewWrapperProps<E extends DomElement = 'div'> = DomElementAsProps<E, {
  ref?: Ref<DomElementRef<E>>
}>

export function NodeViewWrapper<E extends DomElement = 'div'>(props: NodeViewWrapperProps<E>) {
  const context = useSolidNodeView()
  return (
    <Dynamic
      component={props.as || ('div' as any)}
      {...props}
      ref={props.ref}
      data-node-view-wrapper=""
      onDragStart={context.onDragStart}
      style={{
        whiteSpace: 'normal',
        ...props.style,
      }}
    />
  )
}
