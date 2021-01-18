import Vue from 'vue'
import { VueConstructor } from 'vue/types/umd'

export default class VueRenderer {
  vm!: Vue

  constructor(component: Vue | VueConstructor, props: any) {
    const Component = Vue.extend(component)

    this.vm = new Component({
      // parent,
      propsData: props,
    }).$mount()
  }

  get element() {
    return this.vm.$el
  }

  update(data: { [key: string]: any } = {}) {
    if (!this.vm.$props) {
      return
    }

    // prevents `Avoid mutating a prop directly` error message
    const originalSilent = Vue.config.silent
    Vue.config.silent = true

    Object
      .entries(data)
      .forEach(([key, value]) => {
        this.vm.$props[key] = value
      })

    Vue.config.silent = originalSilent
  }

  destroy() {
    this.vm.$destroy()
  }
}
