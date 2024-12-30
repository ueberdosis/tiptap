import { MarkViewRenderer, MarkViewRendererProps } from '@tiptap/core'
import React from 'react'

// import { flushSync } from 'react-dom'
import { ReactRenderer } from './ReactRenderer.js'

export interface MarkViewContextProps {
  markViewContentRef:(element: HTMLElement | null) => void,
}
export const ReactMarkViewContext = React.createContext<MarkViewContextProps>({
  markViewContentRef: () => {
    // do nothing
  },
})

export interface MarkViewContentProps {
  [key: string]: any,
  as?: React.ElementType,
}

export const MarkViewContent: React.FC<MarkViewContentProps> = props => {
  const Tag = props.as || 'span'
  const { markViewContentRef } = React.useContext(ReactMarkViewContext)

  return (
    // @ts-ignore
    <Tag
      {...props}
      ref={markViewContentRef}
      data-mark-view-content=""
    />
  )
}

export function ReactMarkViewRenderer<
  Component extends React.ComponentType<MarkViewRendererProps> = React.ComponentType<MarkViewRendererProps>,
>(
  ComponentToRender: Component,
  { as = 'span', attrs, className = '' }: {
    /**
     * The tag name of the element wrapping the React component.
     */
    as?: string;
    className?: string;
    attrs?: { [key: string]: string};
  } = {},
): MarkViewRenderer {
  return props => {

    if (!(props.editor as any).contentComponent || !props.editor.isInitialized) {
      return {} as unknown as any
    }

    // let didMountContentDomElement = false
    const contentDOMElement = document.createElement('span')

    const markViewContentRef: MarkViewContextProps['markViewContentRef'] = el => {
      if (el && contentDOMElement && el.firstChild !== contentDOMElement) {
        el.appendChild(contentDOMElement)
        didMountContentDomElement = true
      }
    }
    const context: MarkViewContextProps = {
      markViewContentRef,
    }

    // For performance reasons, we memoize the provider component
    // And all of the things it requires are declared outside of the component, so it doesn't need to re-render
    const ReactMarkViewProvider: React.FunctionComponent<MarkViewRendererProps> = React.memo(
      componentProps => {
        return (
          <ReactMarkViewContext.Provider value={context}>
            {React.createElement(ComponentToRender, componentProps)}
          </ReactMarkViewContext.Provider>
        )
      },
    )

    ReactMarkViewProvider.displayName = 'ReactNodeView'

    const renderer = new ReactRenderer(ReactMarkViewProvider, {
      editor: props.editor,
      props,
      as,
      className: `mark-${props.mark.type.name} ${className}`.trim(),
    })

    if (attrs) {
      renderer.updateAttributes(attrs)
    }

    return {
      dom: renderer.element,
      get contentDOM() {
        // if (!didMountContentDomElement) {
        //   return null
        // }
        return contentDOMElement
      },
      destroy: () => {
        didMountContentDomElement = false
      },
    }
  }
}
