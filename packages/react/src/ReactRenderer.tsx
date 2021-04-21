import React from 'react'
import { Editor } from './Editor'

function isClassComponent(Component: any) {
  return !!(
    typeof Component === 'function'
    && Component.prototype
    && Component.prototype.isReactComponent
  )
}

export interface ReactRendererOptions {
  editor: Editor,
  props?: Record<string, any>,
  as?: string,
}

export class ReactRenderer {
  id: string

  editor: Editor

  component: any

  element: Element

  props: Record<string, any>

  reactElement: React.ReactNode

  ref: React.Component | null = null

  constructor(component: React.Component | React.FunctionComponent, { editor, props = {}, as = 'div' }: ReactRendererOptions) {
    this.id = Math.floor(Math.random() * 0xFFFFFFFF).toString()
    this.component = component
    this.editor = editor
    this.props = props
    this.element = document.createElement(as)
    this.element.classList.add('react-renderer')
    this.render()
  }

  render(): void {
    const Component = this.component
    const props = this.props

    if (isClassComponent(Component)) {
      props.ref = (ref: React.Component) => {
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
