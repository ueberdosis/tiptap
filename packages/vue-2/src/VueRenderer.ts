import Vue from 'vue'
import { VueConstructor } from 'vue/types/umd'

/**
 * The VueRenderer class is responsible for rendering a Vue component as a ProseMirror node view.
 */
export class VueRenderer {
  ref!: Vue

  constructor(component: Vue | VueConstructor, props: any) {
    const Component = (typeof component === 'function') ? component : Vue.extend(component)

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
    // Fix: `VueNodeViewRenderer` change vue Constructor `config.silent` not working
    const currentVueConstructor = this.ref.$props.editor?.contentComponent?.$options._base ?? Vue // eslint-disable-line
    const originalSilent = currentVueConstructor.config.silent

    currentVueConstructor.config.silent = true

    Object
      .entries(props)
      .forEach(([key, value]) => {
        this.ref.$props[key] = value
      })

    currentVueConstructor.config.silent = originalSilent
  }

  destroy(): void {
    this.ref.$destroy()
  }
}
