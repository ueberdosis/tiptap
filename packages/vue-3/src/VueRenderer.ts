import { Editor } from '@tiptap/core'
import {
  Component, DefineComponent, h, markRaw, reactive, render,
} from 'vue'

import { Editor as ExtendedEditor } from './Editor.js'

export interface VueRendererOptions {
  editor: Editor,
  props?: Record<string, any>,
}

type ExtendedVNode = ReturnType<typeof h> | null

interface RenderedComponent {
  vNode: ExtendedVNode
  destroy: () => void
  el: Element | null
}

/**
 * This class is used to render Vue components inside the editor.
 */
export class VueRenderer {
  id: string

  renderedComponent!: RenderedComponent

  editor: ExtendedEditor

  component: Component

  el: Element | null

  props: Record<string, any>

  constructor(component: Component, { props = {}, editor }: VueRendererOptions) {
    this.id = Math.floor(Math.random() * 0xFFFFFFFF).toString()
    this.editor = editor as ExtendedEditor
    this.component = markRaw(component)
    this.el = document.createElement('div')
    this.props = reactive(props)
    this.renderedComponent = this.renderComponent()
  }

  get element(): Element | null {
    return this.renderedComponent.el
  }

  renderComponent() {
    let vNode: ExtendedVNode = h(this.component as DefineComponent, this.props)

    if (typeof document !== 'undefined' && this.el) { render(vNode, this.el) }

    const destroy = () => {
      if (this.el) { render(null, this.el) }
      this.el = null
      vNode = null
    }

    return { vNode, destroy, el: this.el ? this.el.firstElementChild : null }
  }

  updateProps(props: Record<string, any> = {}): void {

    Object
      .entries(props)
      .forEach(([key, value]) => {
        this.props[key] = value
      })
    this.renderComponent()
  }

  destroy(): void {
    this.renderedComponent.destroy()
  }
}
