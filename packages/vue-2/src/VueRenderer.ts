import Vue from 'vue'
import { VueConstructor } from 'vue/types/umd'

export class VueRenderer {
  ref!: Vue

  constructor(component: Vue | VueConstructor, props: any) {
    const Component = Vue.extend(component)

    this.ref = new Component(props).$mount()
  }

  get element(): Element {
    return this.ref.$el
  }

  updateProps(props: Record<string, any> = {}): void {
    if (!this.ref.$props) {
      return
    }

    // prevents `Avoid mutating a prop directly` error message
    const originalSilent = Vue.config.silent

    Vue.config.silent = true

    Object
      .entries(props)
      .forEach(([key, value]) => {
        this.ref.$props[key] = value
      })

    Vue.config.silent = originalSilent
  }

  destroy(): void {
    this.ref.$destroy()
  }
}
