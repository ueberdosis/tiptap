import type { Component } from 'vue'

import type { Editor } from './Editor.js'
import { type VueRendererOptions, VueRenderer } from './VueRenderer.js'

export type WidgetRendererOptions<P extends Record<string, any> = object> = {
  editor: Editor
  pos: { from: number; to: number }
  props?: P
}

export class WidgetRenderer {
  static create<P extends Record<string, any> = object>(component: Component, options: WidgetRendererOptions<P>) {
    const { editor, pos, props } = options

    const vueView = new VueRenderer(component, {
      editor,
      props: {
        ...props,
        editor,
        pos,
      },
    } as VueRendererOptions)

    // Return the first element child which contains the actual rendered component
    return vueView.element as HTMLElement
  }
}

export default WidgetRenderer
