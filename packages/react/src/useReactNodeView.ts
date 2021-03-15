import { createContext, useContext } from 'react'

export interface ReactNodeViewContextProps {
  isEditable: boolean,
  onDragStart: (event: DragEvent) => void,
}

export const ReactNodeViewContext = createContext<Partial<ReactNodeViewContextProps>>({
  isEditable: undefined,
  onDragStart: undefined,
})

export const useReactNodeView = () => useContext(ReactNodeViewContext)
