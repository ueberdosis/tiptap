import React from 'react'
import { Editor } from './Editor'

export interface ReactRendererOptions {
  as?: string,
  editor: Editor,
  props?: { [key: string]: any },
}

function isFunctionalComponent(Component: any) {
  return (
    typeof Component === 'function' // can be various things
    && !(
      Component.prototype // native arrows don't have prototypes
      && Component.prototype.isReactComponent // special property
    )
  );
}

function isClassComponent(Component: any) {
  return !!(
    typeof Component === 'function'
    && Component.prototype
    && Component.prototype.isReactComponent
  );
}

export class ReactRenderer {
  id: string

  editor: Editor

  component: any

  element: Element

  props: { [key: string]: any }

  reactElement: React.ReactNode

  ref: React.Component | null = null

  constructor(component: any, { props = {}, editor }: ReactRendererOptions) {
    this.id = Math.floor(Math.random() * 0xFFFFFFFF).toString()
    this.component = component
    this.editor = editor
    this.props = props
    this.element = document.createElement('div')
    this.element.classList.add('react-renderer')
    this.render()
  }

  render() {
    const Component = this.component
    const props = this.props

    if (isClassComponent(Component)) {
      props.ref = (ref: React.Component) => this.ref = ref
    }

    this.reactElement = <Component {...props } />

    if (this.editor?.contentComponent) {
      this.editor.contentComponent.setState({
        // TODO
        // @ts-ignore
        renderers: this.editor.contentComponent.state.renderers.set(
          this.id,
          this,
        ),
      })
    }
  }

  updateProps(props: { [key: string]: any } = {}) {
    this.props = {
      ...this.props,
      ...props,
    }

    this.render()
  }

  destroy() {
    if (this.editor?.contentComponent) {
      // TODO
      // @ts-ignore
      const { renderers } = this.editor.contentComponent.state

      renderers.delete(this.id)

      this.editor.contentComponent.setState({
        renderers,
      })
    }
  }

}
