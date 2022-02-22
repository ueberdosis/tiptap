import React, { createContext, useContext, useState, memo } from 'react'
import ReactDOM from 'react-dom'
import { ReactRenderer } from './ReactRenderer'

/**
 * Create two separate contexts to read from and write to Renderers context.
 * https://kentcdodds.com/blog/how-to-optimize-your-context-value
 */

export const RenderersContext = createContext<Record<string, ReactRenderer>>(Object.create(null))
RenderersContext.displayName = 'RendererContext'
 
export const SetRenderersContext = createContext<(React.Dispatch<React.SetStateAction<Record<string, ReactRenderer<unknown, unknown>>>>)>(() => undefined)
SetRenderersContext.displayName = 'setRendererContext'

export const useRenderers = () => {
  const renderers = useContext(RenderersContext)
  if (!renderers) {
    throw new Error(
      `useRenderers must be used inside of a RenderersProvider`
    )
  }
  return renderers
}

export const useSetRenderers = () => {
  const setRenderers = useContext(SetRenderersContext)
  if (!setRenderers) {
    throw new Error(
      `useSetRenderers must be used inside of a RenderersProvider`
    )
  }
  return setRenderers
}

export const RenderersProvider = ({children}: {children: React.ReactNode}) => {
  const [renderers, setRenderers] = useState<Record<string, ReactRenderer>>(Object.create(null))
  return (
    <RenderersContext.Provider value={renderers}>
      <SetRenderersContext.Provider value={setRenderers}>
        {children}
      </SetRenderersContext.Provider>
    </RenderersContext.Provider>
  )
}

export const Portals: React.FC = memo(() => {
  const renderers = useRenderers()
  return (
    <>
      {Object.entries(renderers).map(([key, renderer]) =>
        ReactDOM.createPortal(
          renderer.reactElement,
          renderer.element,
          key,
        )
      )}
    </>
  )
})