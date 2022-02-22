import React from 'react'
import { Editor } from './Editor'

function isClassComponent(Component: any) {
  return Boolean(
    typeof Component === 'function'
    && Component.prototype
    && Component.prototype.isReactComponent
  )
}

function isForwardRefComponent(Component: any) {
  return Boolean(
    typeof Component === 'object'
    && Component.$$typeof?.toString() === 'Symbol(react.forward_ref)'
  )
}

export interface ReactRendererOptions {
  editor: Editor,
  props?: Record<string, any>,
  as?: string,
  className?: string,
}

type ComponentType<R, P> =
  React.ComponentClass<P> |
  React.FunctionComponent<P> |
  React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<R>>;

export class ReactRenderer<R = unknown, P = unknown> {
  id: string

  editor: Editor

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
  }: ReactRendererOptions) {
    this.id = Math.floor(Math.random() * 0xFFFFFFFF).toString()
    this.component = component
    this.editor = editor
    this.props = props
    this.element = document.createElement(as)
    this.element.classList.add('react-renderer')

    if (className) {
      this.element.classList.add(...className.split(' '))
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

    this.editor.setRenderers?.(prev => {
      const next = {...prev}
      next[this.id] = this
      return next
    })
  }

  updateProps(props: Record<string, any> = {}): void {
    this.props = {
      ...this.props,
      ...props,
    }

    this.render()
  }

  destroy(): void {
    this.editor.setRenderers?.(prev => {
      const next = {...prev}
      delete next[this.id]
      return next
    })
  }
}