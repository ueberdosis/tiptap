import type { EditorWithContentComponent as Editor } from './Editor.js'
import { type ComponentType, ReactRenderer } from './ReactRenderer.js'

export type WidgetRendererOptions<P extends Record<string, any> = object> = {
  editor: Editor
  pos: { from: number; to: number }
  as?: string
  props?: P
}

export class WidgetRenderer {
  static create<R = unknown, P extends Record<string, any> = object>(
    component: ComponentType<R, P>,
    options: WidgetRendererOptions<P>,
  ) {
    const { editor, pos, as = 'span', props } = options

    const reactView = new ReactRenderer(component, {
      editor,
      as,
      props: {
        ...props,
        editor,
        pos,
      },
    })

    // wait for the next frame to render the component
    // otherwise the component will not be rendered correctly or will not have all events attached
    requestAnimationFrame(() => {
      reactView.render()
    })

    return reactView.element
  }
}

export default WidgetRenderer
