import { reactive, markRaw, Component } from 'vue'
import { Editor } from '@tiptap/core'
import { Editor as ExtendedEditor } from './Editor'

export interface VueRendererOptions {
  editor: Editor,
  props?: Record<string, any>,
}

export class VueRenderer {
  id: string

  editor: ExtendedEditor

  component: Component

  teleportElement: Element

  element: Element

  props: Record<string, any>

  constructor(component: Component, { props = {}, editor }: VueRendererOptions) {
    this.id = Math.floor(Math.random() * 0xFFFFFFFF).toString()
    this.editor = editor as ExtendedEditor
    this.component = markRaw(component)
    this.teleportElement = document.createElement('div')
    this.element = this.teleportElement
    this.props = reactive(props)
    this.editor.vueRenderers.set(this.id, this)

    if (this.editor.contentComponent) {
      this.editor.contentComponent.update()

      if (this.teleportElement.children.length !== 1) {
        throw Error('VueRenderer doesn’t support multiple child elements.')
      }

      this.element = this.teleportElement.firstElementChild as Element
    }
  }

  get ref(): any {
    return this.editor.contentComponent?.refs[this.id]
  }

  updateProps(props: Record<string, any> = {}): void {
    Object
      .entries(props)
      .forEach(([key, value]) => {
        this.props[key] = value
      })
  }

  destroy(): void {
    this.editor.vueRenderers.delete(this.id)
  }
}
