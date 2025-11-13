import type Vue from 'vue'
import type { VueConstructor } from 'vue'

import { VueRenderer } from './VueRenderer.js'

export type WidgetRendererOptions<P extends Record<string, any> = object> = {
  editor: any
  pos: { from: number; to: number }
  props?: P
}

export class WidgetRenderer {
  static create<P extends Record<string, any> = object>(
    component: Vue | VueConstructor,
    options: WidgetRendererOptions<P>,
  ) {
    const { editor, pos, props } = options

    const vueView = new VueRenderer(component, {
      ...props,
      editor,
      pos,
    })

    return vueView.element as HTMLElement
  }
}

export default WidgetRenderer
