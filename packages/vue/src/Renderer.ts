import Vue from 'vue'
import { ComponentRenderer } from '@tiptap/core'

export default class Renderer extends ComponentRenderer {

  static type = 'vue'

  vm!: Vue

  constructor(component: Vue, options: any) {
    super()
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

}
