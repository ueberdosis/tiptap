import { Editor, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

import { ReactWidgetRenderer } from './ReactWidgetRenderer.js'

// The component is never actually rendered in these tests (vitest maps JSX to
// @tiptap/core's runtime). We only exercise the renderer's registration and
// lifecycle bookkeeping against a mock content component.
const Widget = () => null

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
 * A widget per paragraph, keyed by paragraph index. Index keys deliberately
 * churn when paragraphs are inserted/removed, which is the scenario that used
 * to leave a surviving widget empty.
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

async function flush() {
  await Promise.resolve()
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('ReactWidgetRenderer', () => {
  let active: Editor | null = null

  afterEach(() => {
    active?.destroy()
    active = null
  })

  it('registers a portal for every widget', async () => {
    const { editor, contentComponent } = createEditor('<p>a</p><p>b</p>')

    active = editor
    await flush()

    expect(contentComponent.live.size).toBe(2)
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

  it('tears down all renderers when decorations are cleared', async () => {
    const { editor, contentComponent } = createEditor('<p>a</p><p>b</p>')

    active = editor
    await flush()
    expect(contentComponent.live.size).toBe(2)

    // clearDecorations() removes the decorations without recomputing — the
    // renderers must still be torn down, not leaked.
    editor.commands.clearDecorations()
    await flush()

    expect(contentComponent.live.size).toBe(0)
  })
})
