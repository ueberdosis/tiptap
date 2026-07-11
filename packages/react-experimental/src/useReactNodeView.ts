import type { ElementType, ReactNode } from 'react'
import { createContext, createElement, useContext } from 'react'

export interface ReactNodeViewContextProps {
  onDragStart?: (event: DragEvent) => void
  nodeViewContentRef?: (element: HTMLElement | null) => void
  /**
   * This allows you to add children into the NodeViewContent component.
   * This is useful when statically rendering the content of a node view.
   */
  nodeViewContentChildren?: ReactNode
  /**
   * Receives the `NodeViewWrapper` element. The renderer maps the node onto
   * it directly — the wrapper IS the node view's DOM, no extra elements.
   */
  nodeViewWrapperRef?: (element: HTMLElement | null) => void
  /**
   * Extra props for the `NodeViewWrapper` element, carrying
   * `ReactNodeViewRenderer`'s `className`/`attrs` options.
   */
  nodeViewWrapperProps?: Record<string, unknown>
  /** Default wrapper tag (`ReactNodeViewRenderer`'s `as` option). */
  nodeViewWrapperAs?: ElementType
  /**
   * Default content tag (`contentDOMElementTag` option, or `span`/`div`
   * from the node's inline flag).
   */
  nodeViewContentAs?: ElementType
}

export const ReactNodeViewContext = createContext<ReactNodeViewContextProps>({
  onDragStart: () => {
    // no-op
  },
  nodeViewContentChildren: undefined,
  nodeViewContentRef: () => {
    // no-op
  },
})

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

export const useReactNodeView = () => useContext(ReactNodeViewContext)
