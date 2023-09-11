import { Editor } from '@tiptap/core'
import React from 'react'

import { Editor as ExtendedEditor } from './Editor.js'

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

  /**
   * The attributes of the element.
   * @type {Record<string, string>}
   * @default {}
   * @example { 'data-foo': 'bar' }
   */
  attrs?: Record<string, string>,
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
export class ReactRenderer<R = unknown, P = unknown> {
  id: string

  editor: ExtendedEditor

  component: any

  element: Element

  props: Record<string, any>

  reactElement: React.ReactNode

  ref: R | null = null

  constructor(component: ComponentType<R, P>, {
    editor,
    props = {},
    as = 'div',
    className = '',
    attrs,
  }: ReactRendererOptions) {
    this.id = Math.floor(Math.random() * 0xFFFFFFFF).toString()
    this.component = component
    this.editor = editor as ExtendedEditor
    this.props = props
    this.element = document.createElement(as)
    this.element.classList.add('react-renderer')

    if (className) {
      this.element.classList.add(...className.split(' '))
    }

    if (attrs) {
      Object.keys(attrs).forEach(key => {
        this.element.setAttribute(key, attrs[key])
      })
    }

    this.render()
  }

  render(): void {
    const Component = this.component
    const props = this.props

    if (isClassComponent(Component) || isForwardRefComponent(Component)) {
      props.ref = (ref: R) => {
        this.ref = ref
      }
    }

    this.reactElement = <Component {...props } />

    this.editor?.contentComponent?.setRenderer(this.id, this)
  }

  updateProps(props: Record<string, any> = {}): void {
    this.props = {
      ...this.props,
      ...props,
    }

    this.render()
  }

  destroy(): void {
    this.editor?.contentComponent?.removeRenderer(this.id)
  }
}
