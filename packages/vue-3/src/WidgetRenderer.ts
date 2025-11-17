import type { Component } from 'vue'
import { markRaw } from 'vue'

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

    // Mark functions as raw so Vue's reactivity doesn't wrap them
    const processedProps: Record<string, any> = props ? { ...props } : {}
    Object.keys(processedProps).forEach(key => {
      if (typeof processedProps[key] === 'function') {
        processedProps[key] = markRaw(processedProps[key])
      }
    })

    const vueView = new VueRenderer(component, {
      editor,
      props: {
        ...processedProps,
        editor: markRaw(editor), // Mark editor as raw to prevent Vue from wrapping it
        pos,
      },
    } as VueRendererOptions)

    // Return the first element child which contains the actual rendered component
    return vueView.element as HTMLElement
  }
}

export default WidgetRenderer
