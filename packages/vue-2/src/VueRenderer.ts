import Vue from 'vue'
import { VueConstructor } from 'vue/types/umd'

export class VueRenderer {
  vm!: Vue

  constructor(component: Vue | VueConstructor, props: any) {
    const Component = Vue.extend(component)

    this.vm = new Component(props).$mount()
  }

  get element() {
    return this.vm.$el
  }

  updateProps(props: { [key: string]: any } = {}) {
    if (!this.vm.$props) {
      return
    }

    // prevents `Avoid mutating a prop directly` error message
    const originalSilent = Vue.config.silent
    Vue.config.silent = true

    Object
      .entries(props)
      .forEach(([key, value]) => {
        this.vm.$props[key] = value
      })

    Vue.config.silent = originalSilent
  }

  destroy() {
    this.vm.$destroy()
  }
}
