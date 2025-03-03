import type { ViewMutationRecord } from '@tiptap/pm/view'

import type { Editor } from './Editor.js'
import type { MarkViewProps, MarkViewRendererOptions } from './types.js'
import { isAndroid, isiOS } from './utilities/index.js'

export class MarkView<Component, Options extends MarkViewRendererOptions = MarkViewRendererOptions> {
  component: Component
  editor: Editor
  options: Options
  mark: MarkViewProps['mark']
  HTMLAttributes: MarkViewProps['HTMLAttributes']

  constructor(component: Component, props: MarkViewProps, options?: Partial<Options>) {
    this.component = component
    this.editor = props.editor
    this.options = { ...options } as Options
    this.mark = props.mark
    this.HTMLAttributes = props.HTMLAttributes
  }

  get dom(): HTMLElement {
    return this.editor.view.dom
  }

  get contentDOM(): HTMLElement | null {
    return null
  }

  ignoreMutation(mutation: ViewMutationRecord): boolean {
    if (!this.dom || !this.contentDOM) {
      return true
    }

    if (typeof this.options.ignoreMutation === 'function') {
      return this.options.ignoreMutation({ mutation })
    }

    if (mutation.type === 'selection') {
      return false
    }

    if (
      this.dom.contains(mutation.target) &&
      mutation.type === 'childList' &&
      (isiOS() || isAndroid()) &&
      this.editor.isFocused
    ) {
      const changedNodes = [...Array.from(mutation.addedNodes), ...Array.from(mutation.removedNodes)] as HTMLElement[]

      if (changedNodes.every(node => node.isContentEditable)) {
        return false
      }
    }

    if (this.contentDOM === mutation.target && mutation.type === 'attributes') {
      return true
    }

    if (this.contentDOM.contains(mutation.target)) {
      return false
    }

    return true
  }
}
