import { type AnyExtension, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { UndoRedo } from '@tiptap/extensions'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CreateElement } from 'vue'

import { Editor } from '../src/Editor.js'
import { VueWidgetRenderer } from '../src/VueWidgetRenderer.js'

let renderCount = 0
let destroyCount = 0
let propDefinitions: Record<string, any> | null = null
let validatorCalls = 0

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

const indexValidator = (value: unknown) => {
  validatorCalls += 1

  return typeof value === 'number'
}

const PropDefinitions = {
  name: 'PropDefinitions',
  props: {
    index: { type: Number, validator: indexValidator },
    label: { type: String, default: 'fallback' },
  },
  created(this: any) {
    propDefinitions = this.$options.props
  },
  render(this: any, h: CreateElement) {
    return h('span', { class: 'prop-definitions' }, `${this.index}:${this.label}`)
  },
}

/**
 * A widget per paragraph, keyed by paragraph index.
 *
 * NOTE: Index-based keys churn when paragraphs are inserted/removed. This is
 * intentional for testing re-keying behavior. In production, use stable domain
 * keys (e.g. `paragraph-${node.attrs.id}`) so the widget DOM and component
 * state are preserved across edits.
 */
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

function propDefinitionsWidget() {
  return Extension.create({
    name: 'propDefinitionsWidget',
    addDecorations() {
      return {
        create: ({ editor, state }) => {
          const first = state.doc.firstChild

          if (!first) {
            return []
          }

          return [
            VueWidgetRenderer(PropDefinitions, {
              editor: editor as unknown as Editor,
              pos: first.nodeSize - 1,
              key: 'prop-definitions',
              props: { index: 1 },
            }),
          ]
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
    propDefinitions = null
    validatorCalls = 0
  })

  function mount(content: string, extraExtensions: AnyExtension[] = []) {
    el = document.createElement('div')
    document.body.appendChild(el)
    editor = new Editor({
      element: el,
      extensions: [Document, Paragraph, Text, paragraphWidgets(), ...extraExtensions],
      content,
    })

    return editor
  }

  function mountWithUndo(content: string) {
    return mount(content, [UndoRedo])
  }

  it('renders a widget per paragraph', () => {
    mount('<p>aaa</p><p>bbb</p>')

    expect(el!.querySelectorAll('.counter').length).toBe(2)
  })

  it('passes ProseMirror widget options through', () => {
    const stopEvent = vi.fn(() => true)
    const destroy = vi.fn()
    const extension = Extension.create({
      name: 'widgetOptions',
      addDecorations: () => ({
        create: ({ editor }) => [
          VueWidgetRenderer(Counter, {
            editor: editor as unknown as Editor,
            pos: 1,
            key: 'options',
            side: -1,
            relaxedSide: true,
            ignoreSelection: true,
            stopEvent,
            destroy,
          }),
        ],
      }),
    })
    mount('<p>a</p>', [extension])
    const decorationState = editor!.state.plugins
      .find(plugin => plugin.props.decorations)
      ?.getState(editor!.state) as
      | { mergedDecorationSet?: { find: () => Array<{ spec: Record<string, unknown> }> } }
      | undefined
    const widget = decorationState?.mergedDecorationSet?.find()[0]

    expect(widget?.spec).toMatchObject({
      side: -1,
      relaxedSide: true,
      ignoreSelection: true,
      stopEvent,
      destroy: expect.any(Function),
    })

    editor!.destroy()
    expect(destroy).not.toHaveBeenCalled()
    editor = null
  })

  it('does not re-render widgets when props are unchanged on a transaction', () => {
    mount('<p>aaa</p><p>bbb</p>')

    const afterMount = renderCount

    editor!.commands.insertContentAt(2, 'X')
    editor!.commands.insertContentAt(2, 'Y')

    expect(renderCount).toBe(afterMount)
  })

  it('preserves declared prop definitions while adding widget props', () => {
    mount('<p>aaa</p>', [propDefinitionsWidget()])

    expect(el!.querySelector('.prop-definitions')?.textContent).toBe('1:fallback')
    expect(validatorCalls).toBeGreaterThan(0)
    expect(propDefinitions?.index.type).toBe(Number)
    expect(propDefinitions?.index.validator).toBe(indexValidator)
    expect(propDefinitions?.label.type).toBe(String)
    expect(propDefinitions?.label.default).toBe('fallback')
    expect(propDefinitions).toHaveProperty('editor')
    expect(propDefinitions).toHaveProperty('getPos')
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

  it('removes stale widgets when setContent replaces the whole document', () => {
    mount('<p>a</p><p>b</p><p>c</p>')
    expect(el!.querySelectorAll('.counter').length).toBe(3)

    editor!.commands.setContent('<p>only</p>')

    expect(editor!.state.doc.childCount).toBe(1)
    expect(el!.querySelectorAll('.counter').length).toBe(1)
  })

  it('destroys all active widget components when the editor is destroyed', () => {
    mount('<p>a</p><p>b</p>')
    expect(el!.querySelectorAll('.counter').length).toBe(2)

    const local = editor!
    const prevDestroy = destroyCount

    local.destroy()

    expect(destroyCount).toBe(prevDestroy + 2)
  })

  it('does not leak components after undo of a paragraph split', () => {
    mountWithUndo('<p>a</p><p>b</p>')
    expect(el!.querySelectorAll('.counter').length).toBe(2)
    const prevDestroy = destroyCount

    // Split first paragraph — 3 widgets.
    editor!.chain().setTextSelection(2).splitBlock().run()
    expect(editor!.state.doc.childCount).toBe(3)
    expect(el!.querySelectorAll('.counter').length).toBe(3)

    // Undo removes the split-created paragraph, which destroys its widget.
    // The 1 unmount is correct cleanup — not a leak.
    editor!.commands.undo()
    expect(editor!.state.doc.childCount).toBe(2)
    expect(el!.querySelectorAll('.counter').length).toBe(2)
    expect(destroyCount).toBe(prevDestroy + 1)
  })

  // Duplicate widget keys intentionally not tested here — ProseMirror's view
  // crashes when it encounters same-key widgets, and the type-level contract
  // ("keys must be unique") is documented on WidgetDecorationDescriptor.key.
})
