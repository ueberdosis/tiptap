import Vue from 'vue'

export default class ComponentView {
  // @ts-ignore
  constructor(component, options) {
    // @ts-ignore
    this.component = component
    // @ts-ignore
    this.dom = this.createDOM()
    // @ts-ignore
    this.contentDOM = this.vm.$refs.content
  }

  createDOM() {
    // @ts-ignore
    const Component = Vue.extend(this.component)

    // @ts-ignore
    this.vm = new Component({
      // parent: this.parent,
      // propsData: props,
    }).$mount()

    // @ts-ignore
    return this.vm.$el
  }

}

