import React from 'react'
import { Editor } from '@tiptap/core'
import { Editor as ExtendedEditor } from './Editor'

function isClassComponent(Component: any) {
  return !!(
    typeof Component === 'function'
    && Component.prototype
    && Component.prototype.isReactComponent
  )
}

function isForwardRefComponent(Component: any) {
  return !!(
    typeof Component === 'object'
    && Component.$$typeof?.toString() === 'Symbol(react.forward_ref)'
  )
}

export interface ReactRendererOptions {
  editor: Editor,
  props?: Record<string, any>,
  as?: string,
}

type ComponentType<R> =
  | React.ComponentClass
  | React.FunctionComponent
  | React.ForwardRefExoticComponent<{ items: any[], command: any } & React.RefAttributes<R>>

export class ReactRenderer<R = unknown> {
  id: string

  editor: ExtendedEditor

  component: any

  element: Element

  props: Record<string, any>

  reactElement: React.ReactNode

  ref: R | null = null

  constructor(component: ComponentType<R>, { editor, props = {}, as = 'div' }: ReactRendererOptions) {
    this.id = Math.floor(Math.random() * 0xFFFFFFFF).toString()
    this.component = component
    this.editor = editor as ExtendedEditor
    this.props = props
    this.element = document.createElement(as)
    this.element.classList.add('react-renderer')
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

    if (this.editor?.contentComponent) {
      this.editor.contentComponent.setState({
        renderers: this.editor.contentComponent.state.renderers.set(
          this.id,
          this,
        ),
      })
    }
  }

  updateProps(props: Record<string, any> = {}): void {
    this.props = {
      ...this.props,
      ...props,
    }

    this.render()
  }

  destroy(): void {
    if (this.editor?.contentComponent) {
      const { renderers } = this.editor.contentComponent.state

      renderers.delete(this.id)

      this.editor.contentComponent.setState({
        renderers,
      })
    }
  }
}
