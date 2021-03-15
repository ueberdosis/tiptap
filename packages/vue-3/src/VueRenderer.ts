import { reactive, markRaw, Component } from 'vue'
import { AnyObject } from '@tiptap/core'
import { Editor } from './Editor'

export interface VueRendererOptions {
  editor: Editor,
  props?: AnyObject,
}

export class VueRenderer {
  id: string

  editor: Editor

  component: Component

  teleportElement: Element

  element: Element

  props: AnyObject

  constructor(component: Component, { props = {}, editor }: VueRendererOptions) {
    this.id = Math.floor(Math.random() * 0xFFFFFFFF).toString()
    this.editor = editor
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

  get ref() {
    return this.editor.contentComponent?.ctx.$refs[this.id]
  }

  updateProps(props: AnyObject = {}) {
    Object
      .entries(props)
      .forEach(([key, value]) => {
        this.props[key] = value
      })
  }

  destroy() {
    this.editor.vueRenderers.delete(this.id)
  }
}
