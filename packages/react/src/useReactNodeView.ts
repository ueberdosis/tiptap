import type { ReactNode } from 'react'
import { createContext, createElement, useContext } from 'react'

/**
 * The value the node view context carries.
 */
export interface ReactNodeViewContextProps {
  onDragStart?: (event: DragEvent) => void
  nodeViewContentRef?: (element: HTMLElement | null) => void
  /**
   * This allows you to add children into the NodeViewContent component.
   * This is useful when statically rendering the content of a node view.
   */
  nodeViewContentChildren?: ReactNode
}

/**
 * Holds the node view for the components below it.
 */
export const ReactNodeViewContext = createContext<ReactNodeViewContextProps>({
  onDragStart: () => {
    // no-op
  },
  nodeViewContentChildren: undefined,
  nodeViewContentRef: () => {
    // no-op
  },
})

/**
 * Provides the node view to `NodeViewContent` and `NodeViewWrapper`.
 */
export const ReactNodeViewContentProvider = ({
  children,
  content,
}: {
  children: ReactNode
  content: ReactNode
}) => {
  return createElement(
    ReactNodeViewContext.Provider,
    { value: { nodeViewContentChildren: content } },
    children,
  )
}

/**
 * Read the node view the component is rendered in.
 */
export const useReactNodeView = () => useContext(ReactNodeViewContext)
