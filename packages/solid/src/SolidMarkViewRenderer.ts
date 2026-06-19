import type { MarkViewProps, MarkViewRenderer, MarkViewRendererOptions } from '@tiptap/core'
import { MarkView } from '@tiptap/core'
import type { MarkView as ProseMirrorMarkView } from '@tiptap/pm/view'
import type { Component } from 'solid-js'

import type { Editor } from './Editor.js'
import { SolidRenderer } from './SolidRenderer.js'

export interface SolidMarkViewRendererOptions extends MarkViewRendererOptions {
  as?: string
  className?: string
  attrs?: { [key: string]: string }
}

export class SolidMarkView extends MarkView<Component, SolidMarkViewRendererOptions> {
  renderer: SolidRenderer

  constructor(
    component: Component,
    props: MarkViewProps,
    options?: Partial<SolidMarkViewRendererOptions>,
  ) {
    super(component, props, options)

    const componentProps = {
      ...props,
      updateAttributes: this.updateAttributes.bind(this),
    } satisfies MarkViewProps

    this.renderer = new SolidRenderer(component, {
      editor: this.editor,
      props: componentProps,
      as: options?.as,
      className: options?.className,
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

export function SolidMarkViewRenderer(
  component: Component,
  options: Partial<SolidMarkViewRendererOptions> = {},
): MarkViewRenderer {
  return props => {
    if (!(props.editor as Editor).contentComponent) {
      return {} as unknown as ProseMirrorMarkView
    }

    return new SolidMarkView(component, props, options)
  }
}
