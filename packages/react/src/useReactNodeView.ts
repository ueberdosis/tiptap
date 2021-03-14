import React, { useContext } from 'react'

export const ReactNodeViewContext = React.createContext<any>({
  isEditable: undefined,
  onDragStart: undefined,
})

export const useReactNodeView = () => useContext(ReactNodeViewContext)
