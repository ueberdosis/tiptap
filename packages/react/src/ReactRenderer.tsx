import { Editor } from '@tiptap/core'
import React from 'react'
import { flushSync } from 'react-dom'

import { EditorWithContentComponent } from './Editor.js'

/**
 * Check if a component is a class component.
 * @param Component
 * @returns {boolean}
 */
function isClassComponent(Component: any) {
  return !!(
    typeof Component === 'function'
    && Component.prototype
    && Component.prototype.isReactComponent
  )
}

/**
 * Check if a component is a forward ref component.
 * @param Component
 * @returns {boolean}
 */
function isForwardRefComponent(Component: any) {
  return !!(
    typeof Component === 'object'
    && Component.$$typeof?.toString() === 'Symbol(react.forward_ref)'
  )
}

export interface ReactRendererOptions {
  /**
   * The editor instance.
   * @type {Editor}
   */
  editor: Editor,

  /**
   * The props for the component.
   * @type {Record<string, any>}
   * @default {}
   */
  props?: Record<string, any>,

  /**
   * The tag name of the element.
   * @type {string}
   * @default 'div'
   */
  as?: string,

  /**
   * The class name of the element.
   * @type {string}
   * @default ''
   * @example 'foo bar'
   */
  className?: string,
}

type ComponentType<R, P> =
  React.ComponentClass<P> |
  React.FunctionComponent<P> |
  React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<R>>;

/**
 * The ReactRenderer class. It's responsible for rendering React components inside the editor.
 * @example
 * new ReactRenderer(MyComponent, {
 *   editor,
 *   props: {
 *     foo: 'bar',
 *   },
 *   as: 'span',
 * })
*/
export class ReactRenderer<R = unknown, P extends Record<string, any> = object> {
  id: string

  editor: Editor

  component: any

  element: Element

  props: P

  reactElement: React.ReactNode

  ref: R | null = null

  /**
   * Immediately creates element and renders the provided React component.
   */
  constructor(component: ComponentType<R, P>, {
    editor,
    props = {},
    as = 'div',
    className = '',
  }: ReactRendererOptions) {
    this.id = Math.floor(Math.random() * 0xFFFFFFFF).toString()
    this.component = component
    this.editor = editor as EditorWithContentComponent
    this.props = props as P
    this.element = document.createElement(as)
    this.element.classList.add('react-renderer')

    if (className) {
      this.element.classList.add(...className.split(' '))
    }

    if (this.editor.isInitialized) {
      // On first render, we need to flush the render synchronously
      // Renders afterwards can be async, but this fixes a cursor positioning issue
      flushSync(() => {
        this.render()
      })
    } else {
      this.render()
    }
  }

  /**
   * Render the React component.
   */
  render(): void {
    const Component = this.component
    const props = this.props
    const editor = this.editor as EditorWithContentComponent

    if (isClassComponent(Component) || isForwardRefComponent(Component)) {
      // @ts-ignore This is a hack to make the ref work
      props.ref = (ref: R) => {
        this.ref = ref
      }
    }

    this.reactElement = <Component {...props} />

    editor?.contentComponent?.setRenderer(this.id, this)
  }

  /**
   * Re-renders the React component with new props.
   */
  updateProps(props: Record<string, any> = {}): void {
    this.props = {
      ...this.props,
      ...props,
    }

    this.render()
  }

  /**
   * Destroy the React component.
   */
  destroy(): void {
    const editor = this.editor as EditorWithContentComponent

    editor?.contentComponent?.removeRenderer(this.id)
  }

  /**
   * Update the attributes of the element that holds the React component.
   */
  updateAttributes(attributes: Record<string, string>): void {
    Object.keys(attributes).forEach(key => {
      this.element.setAttribute(key, attributes[key])
    })
  }
}
