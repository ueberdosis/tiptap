import { Editor, Extension } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { createWidgetDecoration } from '../src/decorations/createWidgetDecoration.js'

const CACHE_KEY = Symbol('testWidgetCache')

interface Push {
  key: string
  props: Record<string, any>
}

const pushes: Push[] = []
const destroyed: string[] = []

/** Stands in for `ReactRenderer` / `VueRenderer` so core can be tested alone. */
class StubRenderer {
  element = document.createElement('span')
  props: Record<string, any>

  constructor(
    private key: string,
    props: Record<string, any>,
  ) {
    this.props = { ...props }
    this.element.className = 'stub'
  }

  updateProps(props: Record<string, any>): void {
    this.props = { ...this.props, ...props }
    pushes.push({ key: this.key, props: { ...props } })
  }

  destroy(): void {
    destroyed.push(this.key)
  }
}

const renderers = new Map<string, StubRenderer>()

/** One stable-keyed widget per paragraph, with a `size` prop that changes on edits. */
function stubWidgets(onDestroy?: (node: Node) => void) {
  return Extension.create({
    name: 'stubWidgets',
    addDecorations() {
      return {
        create: ({ editor, state }) => {
          const decorations: any[] = []
          let index = 0

          state.doc.forEach((node, offset) => {
            const key = `w-${index}`

            decorations.push(
              createWidgetDecoration<StubRenderer>({
                editor,
                pos: offset + node.nodeSize - 1,
                key,
                props: { size: state.doc.content.size },
                cacheKey: CACHE_KEY,
                side: 1,
                destroy: onDestroy,
                context: getPos => ({ editor, getPos }),
                create: renderProps => {
                  const renderer = new StubRenderer(key, renderProps)

                  renderers.set(key, renderer)

                  return renderer
                },
                materialize: renderer => renderer.element,
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

async function flushWidgetProps() {
  await Promise.resolve()
  await new Promise(resolve => setTimeout(resolve, 0))
}

function createEditor(content = '<p>aaa</p>', onDestroy?: (node: Node) => void) {
  const element = document.createElement('div')

  document.body.appendChild(element)

  return new Editor({
    element,
    extensions: [Document, Paragraph, Text, stubWidgets(onDestroy)],
    content,
  })
}

describe('createWidgetDecoration', () => {
  let editor: Editor | null = null

  afterEach(() => {
    editor?.destroy()
    editor = null
    pushes.length = 0
    destroyed.length = 0
    renderers.clear()
  })

  it('never pushes props while a transaction is being applied', () => {
    editor = createEditor()
    pushes.length = 0

    editor.commands.insertContentAt(2, 'X')

    // `create()` runs inside `state.apply`, which must stay pure. The renderer
    // must not be touched until the microtask flush.
    expect(pushes).toEqual([])
  })

  it('pushes changed props on the next microtask', async () => {
    editor = createEditor()
    pushes.length = 0

    editor.commands.insertContentAt(2, 'X')
    await flushWidgetProps()

    expect(pushes).toEqual([{ key: 'w-0', props: { size: 6 } }])
  })

  it('coalesces several transactions into one push per key', async () => {
    editor = createEditor()
    pushes.length = 0

    editor.commands.insertContentAt(2, 'X')
    editor.commands.insertContentAt(2, 'Y')
    editor.commands.insertContentAt(2, 'Z')
    await flushWidgetProps()

    expect(pushes).toEqual([{ key: 'w-0', props: { size: 8 } }])
  })

  it('does not push anything when props are unchanged', async () => {
    editor = createEditor()
    const renderer = renderers.get('w-0')!

    pushes.length = 0
    // Selection-only transactions leave `size` untouched.
    editor.commands.setTextSelection(2)
    editor.commands.setTextSelection(3)
    await flushWidgetProps()

    expect(pushes).toEqual([])
    expect(renderer.props.size).toBe(5)
  })

  it('reuses the renderer for a key instead of remounting it', async () => {
    editor = createEditor()
    const renderer = renderers.get('w-0')

    editor.commands.insertContentAt(2, 'X')
    await flushWidgetProps()

    expect(renderers.get('w-0')).toBe(renderer)
    expect(destroyed).toEqual([])
  })

  it('keeps the renderer when a key is reassigned rather than removed', () => {
    editor = createEditor('<p>aaa</p><p>bbb</p>')
    destroyed.length = 0

    // Splitting shifts paragraph-index keys around, but every key stays live.
    editor.chain().setTextSelection(2).splitBlock().run()

    expect(destroyed).toEqual([])
  })

  it('destroys the renderer when a widget is genuinely removed', () => {
    editor = createEditor('<p>aaa</p><p>bbb</p>')
    destroyed.length = 0

    editor.commands.setContent('<p>aaa</p>')

    expect(destroyed).toEqual(['w-1'])
  })

  it('forwards the user destroy callback once the widget is gone', () => {
    const seen: Node[] = []

    editor = createEditor('<p>aaa</p><p>bbb</p>', node => seen.push(node))
    seen.length = 0

    editor.commands.setContent('<p>aaa</p>')

    expect(seen).toHaveLength(1)
  })

  it('destroys every live renderer when the editor is destroyed', () => {
    editor = createEditor('<p>aaa</p><p>bbb</p>')
    destroyed.length = 0

    editor.destroy()
    editor = null

    expect(destroyed.sort()).toEqual(['w-0', 'w-1'])
  })

  it('drops queued props when the editor is destroyed before the flush', async () => {
    editor = createEditor()

    editor.commands.insertContentAt(2, 'X')
    pushes.length = 0
    editor.destroy()
    editor = null
    await flushWidgetProps()

    expect(pushes).toEqual([])
  })
})
