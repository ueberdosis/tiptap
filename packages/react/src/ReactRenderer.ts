import React from 'react'
import { Editor } from './Editor'

export interface ReactRendererOptions {
  as?: string,
  editor: Editor,
  props?: { [key: string]: any },
}

export class ReactRenderer {
  id: string

  editor: Editor

  component: any

  element: Element

  props: { [key: string]: any }

  reactElement: React.ReactNode

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
    this.reactElement = React.createElement(this.component, this.props)

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
