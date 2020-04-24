import Vue from 'vue'

export default class ComponentView {
  // @ts-ignore
  constructor(component, options) {
    this.mount(component)
  }

  // @ts-ignore
  mount(component) {
    // @ts-ignore
    const Component = Vue.extend(component)

    // @ts-ignore
    this.vm = new Component({
      // parent: this.parent,
      // propsData: props,
    }).$mount()
  }

  get dom() {
    // @ts-ignore
    return this.vm.$el
  }

  get contentDOM() {
    // @ts-ignore
    return this.vm.$refs.content
  }

}

