import React from 'react'
import { Editor } from './Editor'

export interface VueRendererOptions {
  as?: string;
  editor: Editor;
  props?: { [key: string]: any };
}

export class ReactRenderer {
  id: string

  editor: Editor

  component: any

  teleportElement: Element

  element: Element

  props: { [key: string]: any }

  reactElement: React.ReactNode

  constructor(component: any, { props = {}, editor }: VueRendererOptions) {
    this.id = Math.floor(Math.random() * 0xFFFFFFFF).toString()
    this.component = component
    this.editor = editor
    this.props = props

    this.teleportElement = document.createElement('div')
    this.teleportElement.classList.add('teleport-element')
    this.element = this.teleportElement

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
