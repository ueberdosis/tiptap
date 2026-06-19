import { createContext, useContext } from 'solid-js'
import type { JSX } from 'solid-js'

export interface SolidNodeViewContextProps {
  onDragStart?: (event: DragEvent) => void
  decorationClasses?: string
  nodeViewContentRef?: (element: HTMLElement | undefined) => void
}

export const SolidNodeViewContext = createContext<SolidNodeViewContextProps>({})

export const useSolidNodeView = () => useContext(SolidNodeViewContext)

export function SolidNodeViewContextProvider(props: {
  value: SolidNodeViewContextProps
  children: JSX.Element
}) {
  return (
    <SolidNodeViewContext.Provider value={props.value}>
      {props.children}
    </SolidNodeViewContext.Provider>
  )
}
