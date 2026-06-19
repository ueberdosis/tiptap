import type { Component } from 'solid-js'
import { splitProps } from 'solid-js'

import {
  SolidNodeViewContextProvider,
  type SolidNodeViewContextProps,
} from './useSolidNodeView.jsx'

export type NodeViewFrameProps = SolidNodeViewContextProps & {
  component: Component
  editor: unknown
  node: unknown
  decorations: unknown
  innerDecorations: unknown
  view: unknown
  selected: unknown
  extension: unknown
  HTMLAttributes: unknown
  getPos: unknown
  updateAttributes: unknown
  deleteNode: unknown
}

export function NodeViewFrame(props: NodeViewFrameProps) {
  const [frame, child] = splitProps(props, [
    'component',
    'onDragStart',
    'decorationClasses',
    'nodeViewContentRef',
  ])
  const UserComponent = frame.component

  return (
    <SolidNodeViewContextProvider
      value={{
        onDragStart: frame.onDragStart,
        decorationClasses: frame.decorationClasses,
        nodeViewContentRef: frame.nodeViewContentRef,
      }}
    >
      <UserComponent {...child} />
    </SolidNodeViewContextProvider>
  )
}
