import { type AnyExtension, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { UndoRedo } from '@tiptap/extensions'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'

import { Editor } from '../src/Editor.js'
import { VueWidgetRenderer } from '../src/VueWidgetRenderer.js'

let renderCount = 0
let unmountCount = 0

const Counter = defineComponent({
  name: 'Counter',
  inheritAttrs: false,
  props: { index: { type: Number, default: 0 } },
  data() {
    return { count: 0 }
  },
  unmounted() {
    unmountCount += 1
  },
  render() {
    renderCount += 1
    return h('button', { class: 'counter' }, `${this.index}:${this.count}`)
  },
})

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
                editor,
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

// Records the props each render received, so a test can assert the widget never
// loses `editor` / `getPos` during the two-phase prop update.
const propLog: Array<{ hasEditor: boolean; hasGetPos: boolean }> = []

const PropSpy = defineComponent({
  name: 'PropSpy',
  inheritAttrs: false,
  props: {
    size: { type: Number, default: 0 },
    editor: { type: Object, default: null },
    getPos: { type: Function, default: null },
  },
  render() {
    propLog.push({ hasEditor: !!this.editor, hasGetPos: typeof this.getPos === 'function' })
    return h('span', { class: 'spy' })
  },
})

// A single stable-keyed widget whose `size` prop changes on every edit, so the
// pre-render `updateProps` (which pushes only user props, not editor/getPos)
// actually fires.
function spyWidget() {
  return Extension.create({
    name: 'spyWidget',
    addDecorations() {
      return {
        create: ({ editor, state }) => {
          const first = state.doc.firstChild

          if (!first) {
            return []
          }

          return [
            VueWidgetRenderer(PropSpy, {
              editor,
              pos: first.nodeSize - 1,
              key: 'spy-stable',
              props: { size: state.doc.content.size },
              side: 1,
            }),
          ]
        },
      }
    },
  })
}

describe('VueWidgetRenderer', () => {
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
    unmountCount = 0
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

  it('does not re-render widgets when props are unchanged on a transaction', () => {
    mount('<p>aaa</p><p>bbb</p>')

    const afterMount = renderCount

    // Typing does not change any widget's `index` prop — the guard must avoid
    // re-rendering every widget on every transaction (the cause of the hang).
    editor!.commands.insertContentAt(2, 'X')
    editor!.commands.insertContentAt(2, 'Y')
    editor!.commands.insertContentAt(2, 'Z')

    expect(renderCount).toBe(afterMount)
  })

  it('never drops editor/getPos from widget props across updates', () => {
    propLog.length = 0
    mount('<p>aaa</p>', [spyWidget()])

    expect(propLog.length).toBeGreaterThan(0)

    // Each insert changes the spy's `size` prop, triggering the pre-render
    // partial updateProps (which pushes only user props). Because updateProps
    // merges, editor/getPos pushed by the previous render must survive.
    editor!.commands.insertContentAt(2, 'X')
    editor!.commands.insertContentAt(2, 'Y')

    expect(propLog.length).toBeGreaterThan(1)
    expect(propLog.every(entry => entry.hasEditor && entry.hasGetPos)).toBe(true)
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
    const prevUnmount = unmountCount

    local.destroy()

    expect(unmountCount).toBe(prevUnmount + 2)
  })

  it('does not leak components after undo of a paragraph split', () => {
    mountWithUndo('<p>a</p><p>b</p>')
    expect(el!.querySelectorAll('.counter').length).toBe(2)
    const prevUnmount = unmountCount

    // Split first paragraph — 3 widgets.
    editor!.chain().setTextSelection(2).splitBlock().run()
    expect(editor!.state.doc.childCount).toBe(3)
    expect(el!.querySelectorAll('.counter').length).toBe(3)

    // Undo removes the split-created paragraph, which destroys its widget.
    // The 1 unmount is correct cleanup — not a leak.
    editor!.commands.undo()
    expect(editor!.state.doc.childCount).toBe(2)
    expect(el!.querySelectorAll('.counter').length).toBe(2)
    expect(unmountCount).toBe(prevUnmount + 1)
  })

  // Duplicate widget keys intentionally not tested here — ProseMirror's view
  // crashes when it encounters same-key widgets, and the type-level contract
  // ("keys must be unique") is documented on WidgetDecorationDescriptor.key.
})
