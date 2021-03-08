// // @ts-nocheck

// import React from 'react'
// import { render, unmountComponentAtNode } from 'react-dom'

// import { Editor } from './Editor'

// export interface VueRendererOptions {
//   as?: string;
//   editor: Editor;
//   props?: { [key: string]: any };
// }

// export class ReactRenderer {
//   id: string

//   editor: Editor

//   component: any

//   teleportElement: Element

//   element: Element

//   props: { [key: string]: any }

//   constructor(component: any, { props = {}, editor }: VueRendererOptions) {
//     this.id = Math.floor(Math.random() * 0xFFFFFFFF).toString()
//     this.component = component
//     this.editor = editor
//     this.props = props

//     this.teleportElement = document.createElement('div')
//     // this.teleportElement.setAttribute('data-bla', '')
//     // render(React.createElement(component), this.teleportElement)
//     // render(React.createElement(component), this.teleportElement)
//     this.render()
//     // this.element = this.teleportElement.firstElementChild as Element
//     this.element = this.teleportElement
//   }

//   render() {
//     render(React.createElement(this.component), this.teleportElement)
//   }

//   updateProps(props: { [key: string]: any } = {}) {
//     // TODO
//   }

//   destroy() {
//     // TODO
//     // console.log('DESTROY', { bla: this.teleportElement })
//     // console.log(document.querySelector('[data-bla]'))
//     unmountComponentAtNode(this.teleportElement)
//     // unmountComponentAtNode(document.querySelector('[data-bla]'))
//   }

// }
