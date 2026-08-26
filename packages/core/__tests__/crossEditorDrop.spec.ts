import { Editor, Mark, markPasteRule } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

const editorElClass = 'tiptap-cross-editor-drop-test'

const createEditorEl = () => {
  const editorEl = document.createElement('div')

  editorEl.classList.add(editorElClass)
  document.body.appendChild(editorEl)

  return editorEl
}

const PasteMark = Mark.create({
  name: 'pasteMark',
  addPasteRules() {
    return [
      markPasteRule({
        find: /==(.*?)==/g,
        type: this.type,
      }),
    ]
  },
})

const createEditor = () =>
  new Editor({
    element: createEditorEl(),
    extensions: [Document, Paragraph, Text, PasteMark],
    content: '<p>content</p>',
  })

const dragBetween = (source: Editor, target: Editor) => {
  source.view.dom.dispatchEvent(new Event('dragstart', { bubbles: true }))
  target.view.dom.dispatchEvent(new Event('drop', { bubbles: true }))
}

describe('cross editor drop', () => {
  let source: Editor
  let target: Editor

  afterEach(() => {
    vi.useRealTimers()
    source?.destroy()
    target?.destroy()
    document.querySelectorAll(`.${editorElClass}`).forEach(element => element.remove())
  })

  it('does not throw when the source editor is destroyed before the deferred delete runs', () => {
    vi.useFakeTimers()
    source = createEditor()
    target = createEditor()

    dragBetween(source, target)
    source.destroy()

    expect(() => vi.advanceTimersByTime(10)).not.toThrow()
  })

  it('deletes the dragged selection from a source editor that is still alive', () => {
    vi.useFakeTimers()
    source = createEditor()
    target = createEditor()

    source.commands.setTextSelection({ from: 1, to: 8 })
    dragBetween(source, target)
    vi.advanceTimersByTime(10)

    expect(source.getHTML()).toBe('<p></p>')
  })

  it('does not queue a delete when the source editor was destroyed before the drop', () => {
    vi.useFakeTimers()
    source = createEditor()
    target = createEditor()

    source.view.dom.dispatchEvent(new Event('dragstart', { bubbles: true }))
    source.destroy()

    const queuedBeforeDrop = vi.getTimerCount()

    target.view.dom.dispatchEvent(new Event('drop', { bubbles: true }))

    expect(vi.getTimerCount()).toBe(queuedBeforeDrop)
  })

  it('keeps the queued delete when the source editor registers a plugin during the drag', () => {
    vi.useFakeTimers()
    source = createEditor()
    target = createEditor()

    source.commands.setTextSelection({ from: 1, to: 8 })
    source.view.dom.dispatchEvent(new Event('dragstart', { bubbles: true }))
    source.registerPlugin(new Plugin({ key: new PluginKey('noop') }))
    target.view.dom.dispatchEvent(new Event('drop', { bubbles: true }))
    vi.advanceTimersByTime(10)

    expect(source.getHTML()).toBe('<p></p>')
  })
})
