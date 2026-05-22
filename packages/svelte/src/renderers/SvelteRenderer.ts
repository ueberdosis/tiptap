import { mount, unmount } from 'svelte'

export interface SvelteRendererOptions {
  props?: Record<string, any>
}

export class SvelteRenderer {
  private container: Element

  private componentInstance: Record<string, any> | null = null

  private component: any

  destroyed = false

  el: Element | null = null

  props: Record<string, any>

  constructor(component: any, { props = {} }: SvelteRendererOptions = {}) {
    this.component = component
    this.props = { ...props }
    this.container = document.createElement('div')
    this.renderComponent()
  }

  get element(): Element | null {
    return this.el
  }

  get ref(): any {
    return this.componentInstance
  }

  renderComponent() {
    if (this.destroyed) {
      return
    }

    if (this.componentInstance) {
      unmount(this.componentInstance)
      this.componentInstance = null
    }

    this.componentInstance = mount(this.component, {
      target: this.container,
      props: this.props,
    })

    this.el = this.container.firstElementChild
  }

  updateProps(props: Record<string, any> = {}): void {
    if (this.destroyed) {
      return
    }

    Object.assign(this.props, props)
    this.renderComponent()
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
