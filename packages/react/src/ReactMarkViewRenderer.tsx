/* eslint-disable @typescript-eslint/no-shadow */
import type { MarkViewProps, MarkViewRenderer, MarkViewRendererOptions } from '@tiptap/core'
import { MarkView } from '@tiptap/core'
import React from 'react'

// import { flushSync } from 'react-dom'
import { ReactRenderer } from './ReactRenderer.js'

export interface MarkViewContextProps {
  markViewContentRef: (element: HTMLElement | null) => void
}
export const ReactMarkViewContext = React.createContext<MarkViewContextProps>({
  markViewContentRef: () => {
    // do nothing
  },
})

export type MarkViewContentProps<T extends keyof React.JSX.IntrinsicElements = 'span'> = {
  as?: NoInfer<T>
} & React.ComponentProps<T>

export const MarkViewContent: React.FC<MarkViewContentProps> = props => {
  const Tag = props.as || 'span'
  const { markViewContentRef } = React.useContext(ReactMarkViewContext)

  return (
    // @ts-ignore
    <Tag {...props} ref={markViewContentRef} data-mark-view-content="" />
  )
}

export interface ReactMarkViewRendererOptions extends MarkViewRendererOptions {
  /**
   * The tag name of the element wrapping the React component.
   */
  as?: string
  className?: string
  attrs?: { [key: string]: string }
}

export class ReactMarkView extends MarkView<React.ComponentType<MarkViewProps>, ReactMarkViewRendererOptions> {
  renderer: ReactRenderer
  contentDOMElement: HTMLElement | null
  didMountContentDomElement = false

  constructor(
    component: React.ComponentType<MarkViewProps>,
    props: MarkViewProps,
    options?: Partial<ReactMarkViewRendererOptions>,
  ) {
    super(component, props, options)

    const { as = 'span', attrs, className = '' } = options || {}
    const componentProps = props satisfies MarkViewProps

    this.contentDOMElement = document.createElement('span')

    const markViewContentRef: MarkViewContextProps['markViewContentRef'] = el => {
      if (el && this.contentDOMElement && el.firstChild !== this.contentDOMElement) {
        el.appendChild(this.contentDOMElement)
        this.didMountContentDomElement = true
      }
    }
    const context: MarkViewContextProps = {
      markViewContentRef,
    }

    // For performance reasons, we memoize the provider component
    // And all of the things it requires are declared outside of the component, so it doesn't need to re-render
    const ReactMarkViewProvider: React.FunctionComponent<MarkViewProps> = React.memo(componentProps => {
      return (
        <ReactMarkViewContext.Provider value={context}>
          {React.createElement(component, componentProps)}
        </ReactMarkViewContext.Provider>
      )
    })

    ReactMarkViewProvider.displayName = 'ReactNodeView'

    this.renderer = new ReactRenderer(ReactMarkViewProvider, {
      editor: props.editor,
      props: componentProps,
      as,
      className: `mark-${props.mark.type.name} ${className}`.trim(),
    })

    if (attrs) {
      this.renderer.updateAttributes(attrs)
    }
  }

  get dom() {
    return this.renderer.element as HTMLElement
  }

  get contentDOM() {
    if (!this.didMountContentDomElement) {
      return null
    }
    return this.contentDOMElement as HTMLElement
  }
}

export function ReactMarkViewRenderer(
  component: React.ComponentType<MarkViewProps>,
  options: Partial<ReactMarkViewRendererOptions> = {},
): MarkViewRenderer {
  return props => new ReactMarkView(component, props, options)
}
