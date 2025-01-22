/* eslint-disable no-underscore-dangle */
import { MarkView, MarkViewProps, MarkViewRenderer, MarkViewRendererOptions } from '@tiptap/core'
import { Component, defineComponent, h, PropType } from 'vue'

import { Editor } from './Editor.js'
import { VueRenderer } from './VueRenderer.js'

export interface VueMarkViewRendererOptions extends MarkViewRendererOptions {
  as?: string
  className?: string
  attrs?: { [key: string]: string }
}

export const markViewProps = {
  editor: {
    type: Object as PropType<MarkViewProps['editor']>,
    required: true as const,
  },
  mark: {
    type: Object as PropType<MarkViewProps['mark']>,
    required: true as const,
  },
  extension: {
    type: Object as PropType<MarkViewProps['extension']>,
    required: true as const,
  },
  inline: {
    type: Boolean as PropType<MarkViewProps['inline']>,
    required: true as const,
  },
  view: {
    type: Object as PropType<MarkViewProps['view']>,
    required: true as const,
  },
}

export const MarkViewContent = defineComponent({
  name: 'MarkViewContent',

  props: {
    as: {
      type: String,
      default: 'span',
    },
  },

  render() {
    return h(this.as, {
      style: {
        whiteSpace: 'inherit',
      },
      'data-mark-view-content': '',
    })
  },
})

export class VueMarkView extends MarkView<Component, VueMarkViewRendererOptions> {
  renderer: VueRenderer

  constructor(component: Component, props: MarkViewProps, options?: Partial<VueMarkViewRendererOptions>) {
    super(component, props, options)

    // Create extended component with provide
    const extendedComponent = defineComponent({
      extends: { ...component },
      props: Object.keys(props),
      template: (this.component as any).template,
      setup: reactiveProps => {
        return (component as any).setup?.(reactiveProps, {
          expose: () => undefined,
        })
      },
      // Add support for scoped styles
      __scopeId: (component as any).__scopeId,
      __cssModules: (component as any).__cssModules,
      __name: (component as any).__name,
      __file: (component as any).__file,
    })
    this.renderer = new VueRenderer(extendedComponent, {
      editor: this.editor,
      props,
    })
  }

  get dom() {
    return this.renderer.element as HTMLElement
  }

  get contentDOM() {
    return this.dom.querySelector('[data-mark-view-content]') as HTMLElement | null
  }

  destroy() {
    this.renderer.destroy()
  }
}

export function VueMarkViewRenderer(
  component: Component,
  options: Partial<VueMarkViewRendererOptions> = {},
): MarkViewRenderer {
  return props => {
    // try to get the parent component
    // this is important for vue devtools to show the component hierarchy correctly
    // maybe it’s `undefined` because <editor-content> isn’t rendered yet
    if (!(props.editor as Editor).contentComponent) {
      return {} as unknown as MarkView<any, any>
    }

    return new VueMarkView(component, props, options)
  }
}
