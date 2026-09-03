import { type AnyExtension, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { UndoRedo } from '@tiptap/extensions'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
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

// Same as Counter but without inheritAttrs: false. Used to verify the renderer
// auto-declares editor/getPos so they never fall through to the DOM.
const CounterNoInheritAttrs = defineComponent({
  name: 'CounterNoInheritAttrs',
  props: { index: { type: Number, default: 0 } },
  data() {
    return { count: 0 }
  },
  render() {
    return h('button', { class: 'counter-no-inherit' }, `${this.index}:${this.count}`)
  },
})

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

// Widget props queued during a transaction are pushed on the next microtask,
// so `state.apply` stays pure.
async function flushWidgetProps() {
  await Promise.resolve()
  await new Promise(resolve => setTimeout(resolve, 0))
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

  it('passes ProseMirror widget options through', () => {
    const stopEvent = vi.fn(() => true)
    const destroy = vi.fn()
    const extension = Extension.create({
      name: 'widgetOptions',
      addDecorations: () => ({
        create: ({ editor }) => [
          VueWidgetRenderer(Counter, {
            editor,
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

    // Typing does not change any widget's `index` prop — the guard must avoid
    // re-rendering every widget on every transaction (the cause of the hang).
    editor!.commands.insertContentAt(2, 'X')
    editor!.commands.insertContentAt(2, 'Y')
    editor!.commands.insertContentAt(2, 'Z')

    expect(renderCount).toBe(afterMount)
  })

  it('does not push props while a transaction is being applied', async () => {
    propLog.length = 0
    mount('<p>aaa</p>', [spyWidget()])

    const afterMount = propLog.length

    // `create()` runs inside `state.apply`, which must stay pure. VueRenderer
    // renders synchronously on updateProps, so the push has to wait.
    editor!.commands.insertContentAt(2, 'X')
    expect(propLog.length).toBe(afterMount)

    await flushWidgetProps()
    expect(propLog.length).toBeGreaterThan(afterMount)
  })

  it('never drops editor/getPos from widget props across updates', async () => {
    propLog.length = 0
    mount('<p>aaa</p>', [spyWidget()])

    expect(propLog.length).toBeGreaterThan(0)

    // Each insert changes the spy's `size` prop, which queues a deferred
    // updateProps pushing only user props. Because updateProps merges,
    // editor/getPos pushed by the previous render must survive.
    editor!.commands.insertContentAt(2, 'X')
    editor!.commands.insertContentAt(2, 'Y')
    await flushWidgetProps()

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

  it('does not leak editor/getPos as DOM attributes without inheritAttrs: false', () => {
    const extension = Extension.create({
      name: 'noInheritAttrsWidgets',
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
                VueWidgetRenderer(CounterNoInheritAttrs, {
                  editor,
                  pos: offset + node.nodeSize - 1,
                  key: `no-inherit-${index}`,
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

    mount('<p>aaa</p><p>bbb</p>', [extension])

    const buttons = el!.querySelectorAll('.counter-no-inherit')
    expect(buttons.length).toBe(2)

    buttons.forEach(button => {
      expect(button.hasAttribute('editor')).toBe(false)
      expect(button.hasAttribute('getpos')).toBe(false)
      expect(button.hasAttribute('getPos')).toBe(false)
    })
  })

  it('keeps the component prop options: defaults and Boolean casting', () => {
    const seen: Array<{ label: string; flag: boolean }> = []
    const Typed = defineComponent({
      name: 'Typed',
      props: {
        label: { type: String, default: 'FALLBACK' },
        flag: { type: Boolean, default: false },
      },
      render() {
        seen.push({ label: this.label, flag: this.flag })
        return h('span', { class: 'typed' }, this.label)
      },
    })

    mount('<p>a</p>', [
      Extension.create({
        name: 'typedWidget',
        addDecorations: () => ({
          create: ({ editor }) => [
            VueWidgetRenderer(Typed, {
              editor,
              pos: 1,
              key: 'typed',
              // `undefined` must fall back to the default, `''` must cast to true.
              props: { label: undefined, flag: '' },
            }),
          ],
        }),
      }),
    ])

    expect(seen[0]).toEqual({ label: 'FALLBACK', flag: true })
  })

  it('renders a plain functional component', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const Functional = (props: any) => h('span', { class: 'functional' }, String(props.label))

    mount('<p>a</p>', [
      Extension.create({
        name: 'functionalWidget',
        addDecorations: () => ({
          create: ({ editor }) => [
            VueWidgetRenderer(Functional, {
              editor,
              pos: 1,
              key: 'functional',
              props: { label: 'hi' },
            }),
          ],
        }),
      }),
    ])

    const widget = el!.querySelector('.functional')

    expect(widget?.textContent).toBe('hi')
    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining('missing template or render function'),
      expect.anything(),
    )

    warn.mockRestore()
  })

  it('keeps an array props declaration on a functional component', () => {
    const seen: Array<{ label: string; hasEditor: boolean }> = []
    const Functional: any = (props: any) => {
      seen.push({ label: props.label, hasEditor: !!props.editor })
      return h('span', { class: 'functional-array' })
    }

    Functional.props = ['label']

    mount('<p>a</p>', [
      Extension.create({
        name: 'functionalArrayWidget',
        addDecorations: () => ({
          create: ({ editor }) => [
            VueWidgetRenderer(Functional, {
              editor,
              pos: 1,
              key: 'functional-array',
              props: { label: 'hi' },
            }),
          ],
        }),
      }),
    ])

    expect(seen[0]).toEqual({ label: 'hi', hasEditor: true })

    // editor/getPos are declared as props, so they never fall through to the DOM.
    const widget = el!.querySelector('.functional-array')!
    expect(widget.hasAttribute('editor')).toBe(false)
    expect(widget.hasAttribute('getpos')).toBe(false)
  })

  it('gives the component setup an emit function', () => {
    const emitted: string[] = []
    const Emitter = defineComponent({
      name: 'Emitter',
      emits: ['ready'],
      setup(_props, { emit }) {
        emit('ready')
        return () => h('span', { class: 'emitter' })
      },
    })

    mount('<p>a</p>', [
      Extension.create({
        name: 'emitterWidget',
        addDecorations: () => ({
          create: ({ editor }) => [
            VueWidgetRenderer(Emitter, {
              editor,
              pos: 1,
              key: 'emitter',
              props: { onReady: () => emitted.push('ready') },
            }),
          ],
        }),
      }),
    ])

    expect(el!.querySelectorAll('.emitter').length).toBe(1)
    expect(emitted).toEqual(['ready'])
  })

  // Duplicate widget keys intentionally not tested here — ProseMirror's view
  // crashes when it encounters same-key widgets, and the type-level contract
  // ("keys must be unique") is documented on WidgetDecoration.key.
})
