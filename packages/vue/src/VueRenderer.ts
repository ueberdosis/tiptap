// @ts-nocheck

// export default (component: any) => {
//   console.log('vue renderer', component)

//   // return (node, view, getPos) => {
//   return what => {

//     console.log(what)
//     // return new class ImageView {
//     //   constructor(node, view, getPos) {
//     //     this.dom = document.createElement('img')
//     //     this.dom.src = node.attrs.src
//     //     this.dom.alt = node.attrs.alt
//     //     this.dom.addEventListener('click', e => {
//     //       e.preventDefault()
//     //       const alt = prompt('New alt text:', '')
//     //       if (alt) {
//     //         view.dispatch(view.state.tr.setNodeMarkup(getPos(), null, {
//     //           src: node.attrs.src,
//     //           alt,
//     //         }))
//     //       }
//     //     })
//     //   }

//     //   stopEvent() { return true }
//     // }(node, view, getPos)

//   }
// }

import { Editor } from '@tiptap/core'
import { Node as ProsemirrorNode } from 'prosemirror-model'
import { EditorView } from 'prosemirror-view'
import Vue from 'vue'

export default (component: any) => class ImageView {

  vm!: Vue

  constructor(props: { editor: Editor, node: ProsemirrorNode, view: EditorView, getPos: any }) {
    const {
      node, editor, getPos, view,
    } = props
    // const { view } = editor

    // this.dom = document.createElement('div')
    // this.dom.innerHTML = 'hello node view'

    this.mount(component)
  }

  mount(component: Vue) {
    const Component = Vue.extend(component)

    this.vm = new Component({
      // parent: this.parent,
      // propsData: props,
    }).$mount()
  }

  get dom() {
    return this.vm.$el
  }

  get contentDOM() {
    return this.vm.$refs.content
  }

  stopEvent() {
    return true
  }

  // console.log(what)
  // return new class ImageView {
  //   constructor(node, view, getPos) {
  //     this.dom = document.createElement('img')
  //     this.dom.src = node.attrs.src
  //     this.dom.alt = node.attrs.alt
  //     this.dom.addEventListener('click', e => {
  //       e.preventDefault()
  //       const alt = prompt('New alt text:', '')
  //       if (alt) {
  //         view.dispatch(view.state.tr.setNodeMarkup(getPos(), null, {
  //           src: node.attrs.src,
  //           alt,
  //         }))
  //       }
  //     })
  //   }

  //   stopEvent() { return true }
  // }(node, view, getPos)

}
