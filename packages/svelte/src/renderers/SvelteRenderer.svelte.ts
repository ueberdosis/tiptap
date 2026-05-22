import { mount, unmount } from 'svelte'

export interface SvelteRendererOptions {
  props?: Record<string, any>
}

export class SvelteRenderer {
  private container: Element

  private componentInstance: Record<string, any> | null = null

  private component: any

  private store = $state<Record<string, any>>({})

  destroyed = false

  el: Element | null = null

  constructor(component: any, { props = {} }: SvelteRendererOptions = {}) {
    this.component = component
    this.container = document.createElement('div')
    Object.assign(this.store, props)
    this.mountComponent()
  }

  get element(): Element | null {
    return this.el
  }

  get props(): Record<string, any> {
    return this.store
  }

  get ref(): any {
    return this.componentInstance
  }

  private mountComponent() {
    if (this.destroyed) {
      return
    }

    this.componentInstance = mount(this.component, {
      target: this.container,
      props: this.store,
    })

    this.el = this.container.firstElementChild as Element | null
  }

  updateProps(props: Record<string, any> = {}): void {
    if (this.destroyed) {
      return
    }

    Object.assign(this.store, props)
  }

  destroy(): void {
    if (this.destroyed) {
      return
    }

    this.destroyed = true

    if (this.componentInstance) {
      unmount(this.componentInstance)
      this.componentInstance = null
    }

    this.el = null
  }
}
