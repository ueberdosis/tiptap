import VueDefault from 'vue'
import type { VueConstructor } from 'vue/types/umd'

// Properly type Vue as VueConstructor to access static methods with nodenext
const Vue = VueDefault as unknown as VueConstructor
type VueInstance = InstanceType<VueConstructor>

/**
 * The VueRenderer class is responsible for rendering a Vue component as a ProseMirror node view.
 */
export class VueRenderer {
  ref!: VueInstance

  constructor(component: VueInstance | VueConstructor, props: any) {
    const Component = typeof component === 'function' ? component : Vue.extend(component)

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

    Object.entries(props).forEach(([key, value]) => {
      this.ref.$props[key] = value
    })

    currentVueConstructor.config.silent = originalSilent
  }

  destroy(): void {
    this.ref.$destroy()
  }
}
