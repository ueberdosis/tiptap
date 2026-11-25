import { Editor, Mark, markPasteRule } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import { NodeRangeSelection } from '@tiptap/extension-node-range'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

// Two paste rules register two drop handlers, as StarterKit's marks do.
const PasteMarks = Mark.create({
  name: 'pasteMarks',
  addPasteRules() {
    return [
      markPasteRule({ find: /==(.*?)==/g, type: this.type }),
      markPasteRule({ find: /\+\+(.*?)\+\+/g, type: this.type }),
    ]
  },
})

const editors: Editor[] = []

const createEditor = (content: string) => {
  const element = document.createElement('div')

  document.body.appendChild(element)

  const editor = new Editor({
    element,
    extensions: [Document, Paragraph, Text, PasteMarks],
    content,
  })

  editors.push(editor)

  return editor
}

describe('cross editor drag of a drag handle selection', () => {
  afterEach(() => {
    vi.useRealTimers()
    editors.splice(0).forEach(editor => editor.destroy())
    document.body.replaceChildren()
  })

  it('deletes only the dragged block from the source editor', () => {
    vi.useFakeTimers()

    const source = createEditor('<p>one</p><p>two</p>')
    const target = createEditor('<p>target</p>')

    source.view.dispatch(
      source.state.tr.setSelection(NodeRangeSelection.create(source.state.doc, 0, 5)),
    )
    source.view.dom.dispatchEvent(new Event('dragstart', { bubbles: true }))
    target.view.dom.dispatchEvent(new Event('drop', { bubbles: true }))
    vi.advanceTimersByTime(10)

    expect(source.getHTML()).toBe('<p>two</p>')
  })
})
