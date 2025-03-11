/* eslint-disable @typescript-eslint/no-shadow */
import type { MarkViewProps, MarkViewRenderer, MarkViewRendererOptions } from '@tiptap/core'
import { MarkView } from '@tiptap/core'
import type { Component, ComponentProps, JSX } from 'solid-js'
import { createContext, useContext } from 'solid-js'
import { Dynamic } from 'solid-js/web'

import { SolidRenderer } from './SolidRenderer.js'

export interface MarkViewContextProps {
  markViewContentRef: (element: HTMLElement | null) => void
}
export const SolidMarkViewContext = createContext<MarkViewContextProps>({
  markViewContentRef: () => {
    // do nothing
  },
})

export type MarkViewContentProps<T extends keyof JSX.IntrinsicElements = 'span'> = {
  as?: NoInfer<T>
} & ComponentProps<T>

export const MarkViewContent: Component<MarkViewContentProps> = props => {
  const Tag = props.as || 'span'
  const { markViewContentRef } = useContext(SolidMarkViewContext)

  return <Tag {...props} ref={markViewContentRef} data-mark-view-content="" />
}

export interface SolidMarkViewRendererOptions extends MarkViewRendererOptions {
  /**
   * The tag name of the element wrapping the Solid component.
   */
  as?: string
  className?: string
  attrs?: { [key: string]: string }
}

export class SolidMarkView extends MarkView<Component<MarkViewProps>, SolidMarkViewRendererOptions> {
  renderer: SolidRenderer
  contentDOMElement: HTMLElement | null
  didMountContentDomElement = false

  constructor(
    component: Component<MarkViewProps>,
    props: MarkViewProps,
    options?: Partial<SolidMarkViewRendererOptions>,
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
    const SolidMarkViewProvider: Component<MarkViewProps> = componentProps => {
      return (
        <SolidMarkViewContext.Provider value={context}>
          <Dynamic component={component} {...componentProps} />
        </SolidMarkViewContext.Provider>
      )
    }

    this.renderer = new SolidRenderer(SolidMarkViewProvider, {
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

export function SolidMarkViewRenderer(
  component: Component<MarkViewProps>,
  options: Partial<SolidMarkViewRendererOptions> = {},
): MarkViewRenderer {
  return props => new SolidMarkView(component, props, options)
}
