import { Editor, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { EditorContent } from './EditorContent.js'
import { ReactWidgetRenderer } from './ReactWidgetRenderer.js'

import { UndoRedo } from '@tiptap/extensions'

vi.mock('@tiptap/core/jsx-runtime', async () => import('react/jsx-runtime'))
vi.mock('@tiptap/core/jsx-dev-runtime', async () => import('react/jsx-dev-runtime'))

// The lifecycle tests below use this lightweight component with a mock content
// component. Separate tests mount widgets through a real React root.
const Widget = () => null

let widgetRenderCount = 0
const propLog: Array<{ editor: Editor; getPos: unknown }> = []

const RenderCounter = () => {
  widgetRenderCount += 1

  return React.createElement('span', { className: 'render-counter' })
}

const PropSpy = ({ editor, getPos }: { editor: Editor; getPos: unknown }) => {
  propLog.push({ editor, getPos })

  return React.createElement('span', { className: 'prop-spy' })
}

const AttributeWidget = ({ index }: { index: number }) =>
  React.createElement('span', { className: 'attribute-widget' }, index)

function makeContentComponent() {
  const live = new Set<string>()

  return {
    live,
    setRenderer(id: string) {
      live.add(id)
    },
    removeRenderer(id: string) {
      live.delete(id)
    },
    subscribe: () => () => {},
    getSnapshot: () => ({}),
    getServerSnapshot: () => ({}),
  }
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
              ReactWidgetRenderer(Widget, {
                editor,
                pos: offset + node.nodeSize - 1,
                key: `p-${index}`,
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

function unchangedPropsWidget() {
  return Extension.create({
    name: 'unchangedPropsWidget',
    addDecorations() {
      return {
        create: ({ editor, state }) => {
          const first = state.doc.firstChild

          if (!first) {
            return []
          }

          return [
            ReactWidgetRenderer(RenderCounter, {
              editor,
              pos: first.nodeSize - 1,
              key: 'render-counter',
              props: { label: 'constant' },
            }),
          ]
        },
      }
    },
  })
}

function propSpyWidget() {
  return Extension.create({
    name: 'propSpyWidget',
    addDecorations() {
      return {
        create: ({ editor, state }) => {
          const first = state.doc.firstChild

          if (!first) {
            return []
          }

          return [
            ReactWidgetRenderer(PropSpy, {
              editor,
              pos: first.nodeSize - 1,
              key: 'prop-spy',
              props: { size: state.doc.content.size },
            }),
          ]
        },
      }
    },
  })
}

function copiedKeyWidgets() {
  return Extension.create({
    name: 'copiedKeyWidgets',
    addGlobalAttributes: () => [{ types: ['paragraph'], attributes: { id: { default: null } } }],
    addDecorations: () => ({
      create: ({ editor, state }) => {
        const decorations: any[] = []
        let index = 0

        state.doc.forEach((node, pos) => {
          if (node.type.name === 'paragraph') {
            decorations.push(
              ReactWidgetRenderer(AttributeWidget, {
                editor,
                pos: pos + node.nodeSize - 1,
                key: `paragraph-${node.attrs.id}`,
                props: { index },
              }),
            )
            index += 1
          }
        })

        return decorations
      },
    }),
    addProseMirrorPlugins: () => [
      new Plugin({
        key: new PluginKey('repairCopiedIds'),
        appendTransaction: (transactions, _oldState, newState) => {
          if (!transactions.some(transaction => transaction.docChanged)) {
            return
          }

          const ids = new Set<string>()
          const tr = newState.tr

          newState.doc.forEach((node, pos) => {
            const id = node.attrs.id

            if (node.type.name === 'paragraph' && id && ids.has(id)) {
              tr.setNodeAttribute(pos, 'id', `${id}-copy`)
            }

            ids.add(id)
          })

          return tr.steps.length ? tr : undefined
        },
      }),
    ],
  })
}

function createEditor(content: string) {
  const contentComponent = makeContentComponent()
  const editor = new Editor({
    extensions: [Document, Paragraph, Text, paragraphWidgets()],
    content,
  })

  ;(editor as any).contentComponent = contentComponent
  ;(editor as any).isEditorContentInitialized = true

  return { editor, contentComponent }
}

function createEditorWithUndo(content: string) {
  const contentComponent = makeContentComponent()
  const editor = new Editor({
    extensions: [Document, Paragraph, Text, paragraphWidgets(), UndoRedo],
    content,
  })

  ;(editor as any).contentComponent = contentComponent
  ;(editor as any).isEditorContentInitialized = true

  return { editor, contentComponent }
}

function createMountedEditor(content: string, extension: Extension) {
  const editor = new Editor({
    extensions: [Document, Paragraph, Text, extension],
    content,
  })
  const mounted = render(React.createElement(EditorContent, { editor }))

  return { editor, ...mounted }
}

async function flush() {
  await Promise.resolve()
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('ReactWidgetRenderer', () => {
  let active: Editor | null = null
  let unmount: (() => void) | null = null

  afterEach(() => {
    unmount?.()
    unmount = null
    active?.destroy()
    active = null
    widgetRenderCount = 0
    propLog.length = 0
  })

  it('registers a portal for every widget', async () => {
    const { editor, contentComponent } = createEditor('<p>a</p><p>b</p>')

    active = editor
    await flush()

    expect(contentComponent.live.size).toBe(2)
  })

  it('passes ProseMirror widget options through', () => {
    const stopEvent = vi.fn(() => true)
    const destroy = vi.fn()
    const extension = Extension.create({
      name: 'widgetOptions',
      addDecorations: () => ({
        create: ({ editor }) => [
          ReactWidgetRenderer(Widget, {
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
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, extension],
      content: '<p>a</p>',
    })
    const decorationState = editor.state.plugins
      .find(plugin => plugin.props.decorations)
      ?.getState(editor.state) as
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

    editor.destroy()
    expect(destroy).not.toHaveBeenCalled()
  })

  it('does not render a mounted widget again when props are unchanged', async () => {
    const mounted = createMountedEditor('<p>a</p>', unchangedPropsWidget())

    active = mounted.editor
    unmount = mounted.unmount
    await waitFor(() => expect(widgetRenderCount).toBeGreaterThan(0))
    const rendersAfterMount = widgetRenderCount

    mounted.editor.commands.insertContentAt(2, 'X')
    await flush()

    expect(widgetRenderCount).toBe(rendersAfterMount)
  })

  it('keeps editor and getPos when mounted widget props change', async () => {
    const mounted = createMountedEditor('<p>a</p>', propSpyWidget())

    active = mounted.editor
    unmount = mounted.unmount
    await waitFor(() => expect(propLog.length).toBeGreaterThan(0))

    mounted.editor.commands.insertContentAt(2, 'X')
    await flush()
    mounted.editor.commands.insertContentAt(2, 'Y')
    await flush()

    expect(propLog.length).toBeGreaterThan(1)
    expect(propLog.every(entry => entry.editor === mounted.editor)).toBe(true)
    expect(propLog.every(entry => typeof entry.getPos === 'function')).toBe(true)
  })

  it('keeps every widget registered when keys are reassigned by a split', async () => {
    const { editor, contentComponent } = createEditor('<p>a</p><p>b</p>')

    active = editor
    await flush()
    expect(contentComponent.live.size).toBe(2)

    // Splitting inserts a paragraph; index-based keys churn (the old second
    // paragraph's key shifts), which previously clobbered a reused renderer.
    editor.chain().setTextSelection(2).splitBlock().run()
    await flush()

    expect(editor.state.doc.childCount).toBe(3)
    expect(contentComponent.live.size).toBe(3)
  })

  it('keeps props from the final state when an appended transaction repairs a copied key', async () => {
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, copiedKeyWidgets()],
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph', attrs: { id: 'first' }, content: [{ type: 'text', text: 'a' }] },
          { type: 'paragraph', attrs: { id: 'second' }, content: [{ type: 'text', text: 'b' }] },
        ],
      },
    })
    const mounted = render(React.createElement(EditorContent, { editor }))

    active = editor
    unmount = mounted.unmount
    editor.chain().setTextSelection(2).splitBlock().run()
    await flush()

    expect(Array.from(mounted.container.querySelectorAll('.attribute-widget'))).toHaveLength(3)
    expect(
      Array.from(mounted.container.querySelectorAll('.attribute-widget')).map(widget =>
        widget.textContent?.trim(),
      ),
    ).toEqual(['0', '1', '2'])
  })

  it('tears down the renderer when a widget is genuinely removed', async () => {
    const { editor, contentComponent } = createEditor('<p>aaa</p><p>bbb</p>')

    active = editor
    await flush()
    expect(contentComponent.live.size).toBe(2)

    // Join the two paragraphs into one — the second widget should be removed.
    editor.chain().setTextSelection(6).joinBackward().run()
    await flush()

    expect(editor.state.doc.childCount).toBe(1)
    expect(contentComponent.live.size).toBe(1)
  })

  it('tears down stale widgets when setContent replaces the whole document', async () => {
    const { editor, contentComponent } = createEditor('<p>a</p><p>b</p><p>c</p>')

    active = editor
    await flush()
    expect(contentComponent.live.size).toBe(3)

    editor.commands.setContent('<p>only</p>')
    await flush()

    expect(editor.state.doc.childCount).toBe(1)
    expect(contentComponent.live.size).toBe(1)
  })

  it('destroys all active widget renderers when the editor is destroyed', async () => {
    const { editor, contentComponent } = createEditor('<p>a</p><p>b</p>')

    // Don't assign to `active` — we destroy manually before afterEach.
    const activeRef = editor
    await flush()
    expect(contentComponent.live.size).toBe(2)

    activeRef.destroy()
    await flush()

    expect(contentComponent.live.size).toBe(0)
  })

  it('does not leak renderers after undo of a paragraph split', async () => {
    const { editor, contentComponent } = createEditorWithUndo('<p>a</p><p>b</p>')

    active = editor
    await flush()
    expect(contentComponent.live.size).toBe(2)

    // Split first paragraph — 3 widgets.
    editor.chain().setTextSelection(2).splitBlock().run()
    await flush()
    expect(editor.state.doc.childCount).toBe(3)
    expect(contentComponent.live.size).toBe(3)

    // Undo removes the split-created paragraph, which destroys its widget.
    // The 1 removal is correct cleanup — not a leak.
    editor.commands.undo()
    await flush()
    expect(editor.state.doc.childCount).toBe(2)
    expect(contentComponent.live.size).toBe(2)
  })

  // Duplicate widget keys intentionally not tested here — ProseMirror's view
  // crashes when it encounters same-key widgets, and the type-level contract
  // ("keys must be unique") is documented on WidgetDecoration.key.
})
