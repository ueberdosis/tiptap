import type { Mark } from '@tiptap/pm/model'
import type { ViewMutationRecord } from '@tiptap/pm/view'

import type { Editor } from './Editor.js'
import type { MarkViewProps, MarkViewRendererOptions } from './types.js'
import { isAndroid, isiOS } from './utilities/index.js'

export function updateMarkViewAttributes(checkMark: Mark, editor: Editor, attrs: Record<string, any> = {}): void {
  const { state } = editor
  const { doc, tr } = state
  const thisMark = checkMark

  doc.descendants((node, pos) => {
    const from = tr.mapping.map(pos)
    const to = tr.mapping.map(pos) + node.nodeSize
    let foundMark: Mark | null = null

    // find the mark on the current node
    node.marks.forEach(mark => {
      if (mark !== thisMark) {
        return false
      }

      foundMark = mark
    })

    if (!foundMark) {
      return
    }

    // check if we need to update given the attributes
    let needsUpdate = false
    Object.keys(attrs).forEach(k => {
      if (attrs[k] !== foundMark!.attrs[k]) {
        needsUpdate = true
      }
    })

    if (needsUpdate) {
      const updatedMark = checkMark.type.create({
        ...checkMark.attrs,
        ...attrs,
      })

      tr.removeMark(from, to, checkMark.type)
      tr.addMark(from, to, updatedMark)
    }
  })

  if (tr.docChanged) {
    editor.view.dispatch(tr)
  }
}

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

  /**
   * Update the attributes of the mark in the document.
   * @param attrs The attributes to update.
   */
  updateAttributes(attrs: Record<string, any>, checkMark?: Mark): void {
    updateMarkViewAttributes(checkMark || this.mark, this.editor, attrs)
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
