// @ts-nocheck

import React from 'react'
import ReactDOM, { render, unmountComponentAtNode } from 'react-dom'

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

  constructor(component: any, { props = {}, editor }: VueRendererOptions) {
    this.id = Math.floor(Math.random() * 0xFFFFFFFF).toString()
    this.component = component
    this.editor = editor
    this.props = props

    this.teleportElement = document.createElement('div')
    this.teleportElement.classList.add('teleport-element')
    this.element = this.teleportElement

    // this.teleportElement.setAttribute('data-bla', '')
    // render(React.createElement(component), this.teleportElement)
    // render(React.createElement(component), this.teleportElement)
    // this.render()
    // // this.element = this.teleportElement.firstElementChild as Element

    // console.log({ props })

    // this.bla = ReactDOM.createPortal(
    //   React.createElement(this.component, props),
    //   this.teleportElement,
    // )
    this.render()
    // this.comp = React.createElement(this.component, { foo: 1 })

    // // this.bla = React.createElement(this.component, props)

    // // console.log({ bla })

    // if (this.editor?.contentComponent) {
    //   this.editor.contentComponent.setState({
    //     renderers: this.editor.contentComponent.state.renderers.set(
    //       this.id,
    //       this,
    //     ),
    //   })
    // }
  }

  // get comp() {
  //   console.log('get comp')
  //   return React.createElement(this.component, { foo: 1 })
  // }

  render() {
    this.comp = React.createElement(this.component, { foo: 1 })
    // render(React.createElement(this.component), this.teleportElement)

    if (this.editor?.contentComponent) {
      this.editor.contentComponent.setState({
        renderers: this.editor.contentComponent.state.renderers.set(
          this.id,
          this,
        ),
      })
    }
  }

  updateProps(props: { [key: string]: any } = {}) {
    // TODO
    // console.log('update props', { props })
  }

  destroy() {
    // TODO
    // console.log('DESTROY', { bla: this.teleportElement })
    // console.log(document.querySelector('[data-bla]'))
    // unmountComponentAtNode(this.teleportElement)
    // unmountComponentAtNode(document.querySelector('[data-bla]'))

    if (this.editor?.contentComponent) {
      const { renderers } = this.editor.contentComponent.state

      renderers.delete(this.id)

      this.editor.contentComponent.setState({
        renderers,
      })
    }
  }

}
