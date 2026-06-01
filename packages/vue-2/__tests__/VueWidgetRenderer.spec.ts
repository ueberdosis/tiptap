import { Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'
import type { CreateElement } from 'vue'

import { Editor } from '../src/Editor.js'
import { VueWidgetRenderer } from '../src/VueWidgetRenderer.js'

let renderCount = 0
let destroyCount = 0

const Counter = {
  name: 'Counter',
  props: { index: { type: Number, default: 0 } },
  data() {
    return { count: 0 }
  },
  destroyed() {
    destroyCount += 1
  },
  render(this: any, h: CreateElement) {
    renderCount += 1
    return h('button', { class: 'counter' }, `${this.index}:${this.count}`)
  },
}

function paragraphWidgets() {
  return Extension.create({
    name: 'paragraphWidgets',
    addDecorations() {
      return {
        create: ({ editor, state }) => {
          const decorations: any[] = []
          let index = 0

          state.doc.forEach((node, offset) => {
            if (node.type.name !== 'paragraph') {
              return
            }
            decorations.push(
              VueWidgetRenderer(Counter, {
                editor: editor as unknown as Editor,
                pos: offset + node.nodeSize - 1,
                key: `p-${index}`,
                props: { index },
                side: 1,
              }),
            )
            index += 1
          })

          return decorations
        },
      }
    },
  })
}

describe('VueWidgetRenderer (vue-2)', () => {
  let editor: Editor | null = null
  let el: HTMLElement | null = null

  afterEach(() => {
    editor?.destroy()
    editor = null
    if (el?.parentNode) {
      el.parentNode.removeChild(el)
    }
    el = null
    renderCount = 0
    destroyCount = 0
  })

  function mount(content: string) {
    el = document.createElement('div')
    document.body.appendChild(el)
    editor = new Editor({
      element: el,
      extensions: [Document, Paragraph, Text, paragraphWidgets()],
      content,
    })

    return editor
  }

  it('renders a widget per paragraph', () => {
    mount('<p>aaa</p><p>bbb</p>')

    expect(el!.querySelectorAll('.counter').length).toBe(2)
  })

  it('does not re-render widgets when props are unchanged on a transaction', () => {
    mount('<p>aaa</p><p>bbb</p>')

    const afterMount = renderCount

    editor!.commands.insertContentAt(2, 'X')
    editor!.commands.insertContentAt(2, 'Y')

    expect(renderCount).toBe(afterMount)
  })

  it('keeps every widget mounted when keys are reassigned by a split', () => {
    mount('<p>aaa</p><p>bbb</p>')
    expect(el!.querySelectorAll('.counter').length).toBe(2)

    editor!.chain().setTextSelection(2).splitBlock().run()

    expect(editor!.state.doc.childCount).toBe(3)
    expect(el!.querySelectorAll('.counter').length).toBe(3)
  })

  it('removes the widget when a paragraph is removed', () => {
    mount('<p>aaa</p><p>bbb</p>')
    expect(el!.querySelectorAll('.counter').length).toBe(2)

    editor!.chain().setTextSelection(6).joinBackward().run()

    expect(editor!.state.doc.childCount).toBe(1)
    expect(el!.querySelectorAll('.counter').length).toBe(1)
  })

  it('tears down all renderers when decorations are cleared', () => {
    mount('<p>a</p><p>b</p>')
    expect(el!.querySelectorAll('.counter').length).toBe(2)

    // clearDecorations() removes the decorations without recomputing — the
    // component instances must be destroyed, not leaked.
    editor!.commands.clearDecorations()

    expect(el!.querySelectorAll('.counter').length).toBe(0)
    expect(destroyCount).toBe(2)
  })
})
