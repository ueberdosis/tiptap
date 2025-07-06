import type { Editor } from '@tiptap/core'
import type {
  ComponentClass,
  ForwardRefExoticComponent,
  FunctionComponent,
  PropsWithoutRef,
  ReactNode,
  RefAttributes,
} from 'react'
import React, { version as reactVersion } from 'react'
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
    && Component.$$typeof
    && (Component.$$typeof.toString() === 'Symbol(react.forward_ref)'
      || Component.$$typeof.description === 'react.forward_ref')
  )
}

/**
 * Check if a component is a memoized component.
 * @param Component
 * @returns {boolean}
 */
function isMemoComponent(Component: any) {
  return !!(
    typeof Component === 'object'
    && Component.$$typeof
    && (Component.$$typeof.toString() === 'Symbol(react.memo)' || Component.$$typeof.description === 'react.memo')
  )
}

/**
 * Check if a component can safely receive a ref prop.
 * This includes class components, forwardRef components, and memoized components
 * that wrap forwardRef or class components.
 * @param Component
 * @returns {boolean}
 */
function canReceiveRef(Component: any) {
  // Check if it's a class component
  if (isClassComponent(Component)) {
    return true
  }

  // Check if it's a forwardRef component
  if (isForwardRefComponent(Component)) {
    return true
  }

  // Check if it's a memoized component
  if (isMemoComponent(Component)) {
    // For memoized components, check the wrapped component
    const wrappedComponent = Component.type

    if (wrappedComponent) {
      return isClassComponent(wrappedComponent) || isForwardRefComponent(wrappedComponent)
    }
  }

  return false
}

/**
 * Check if we're running React 19+ by detecting if function components support ref props
 * @returns {boolean}
 */
function isReact19Plus(): boolean {
  // React 19 is detected by checking React version if available
  // In practice, we'll use a more conservative approach and assume React 18 behavior
  // unless we can definitively detect React 19
  try {
    // @ts-ignore
    if (reactVersion) {
      const majorVersion = parseInt(reactVersion.split('.')[0], 10)

      return majorVersion >= 19
    }
  } catch {
    // Fallback to React 18 behavior if we can't determine version
  }
  return false
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
  | ComponentClass<P>
  | FunctionComponent<P>
  | ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<R>>

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

  reactElement: ReactNode

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

    // If the editor is already initialized, we will need to
    // synchronously render the component to ensure it renders
    // together with Prosemirror's rendering.
    if (this.editor.isInitialized) {
      flushSync(() => {
        this.render()
      })
    } else {
      queueMicrotask(() => {
        this.render()
      })
    }
  }

  /**
   * Render the React component.
   */
  render(): void {
    const Component = this.component
    const props = this.props
    const editor = this.editor as EditorWithContentComponent

    // Handle ref forwarding with React 18/19 compatibility
    const isReact19 = isReact19Plus()
    const componentCanReceiveRef = canReceiveRef(Component)

    const elementProps = { ...props }

    // Always remove ref if the component cannot receive it (unless React 19+)
    if (elementProps.ref && !(isReact19 || componentCanReceiveRef)) {
      delete elementProps.ref
    }

    // Only assign our own ref if allowed
    if (!elementProps.ref && (isReact19 || componentCanReceiveRef)) {
      // @ts-ignore - Setting ref prop for compatible components
      elementProps.ref = (ref: R) => {
        this.ref = ref
      }
    }

    this.reactElement = <Component {...elementProps} />

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
