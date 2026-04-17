import { Editor, Mark, markPasteRule } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

const pasteRegex = /==(.*?)==/g
const editorElClass = 'tiptap-mark-paste-rule-test'

const createEditorEl = () => {
  const editorEl = document.createElement('div')

  editorEl.classList.add(editorElClass)
  document.body.appendChild(editorEl)

  return editorEl
}

const InclusiveMark = Mark.create({
  name: 'inclusiveMark',
  inclusive: true,
  parseHTML() {
    return [{ tag: 'span[data-inclusive-mark]' }]
  },
  renderHTML() {
    return ['span', { 'data-inclusive-mark': 'true' }, 0]
  },
  addPasteRules() {
    return [
      markPasteRule({
        find: pasteRegex,
        type: this.type,
      }),
    ]
  },
})

const ExclusiveMark = Mark.create({
  name: 'exclusiveMark',
  inclusive: false,
  parseHTML() {
    return [{ tag: 'span[data-exclusive-mark]' }]
  },
  renderHTML() {
    return ['span', { 'data-exclusive-mark': 'true' }, 0]
  },
  addPasteRules() {
    return [
      markPasteRule({
        find: pasteRegex,
        type: this.type,
      }),
    ]
  },
})

describe('markPasteRule', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
    document.querySelector(`.${editorElClass}`)?.remove()
  })

  it('keeps typing inside an inclusive mark when pasted text ends in that mark', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [Document, Paragraph, Text, InclusiveMark],
    })

    editor.view.pasteText('==test==')
    editor.commands.insertContent('x')

    expect(editor.getHTML()).toBe('<p><span data-inclusive-mark="true">testx</span></p>')
  })

  it('keeps typing outside a non-inclusive mark when pasted text ends in that mark', () => {
    editor = new Editor({
      element: createEditorEl(),
      extensions: [Document, Paragraph, Text, ExclusiveMark],
    })

    editor.view.pasteText('==test==')
    editor.commands.insertContent('x')

    expect(editor.getHTML()).toBe('<p><span data-exclusive-mark="true">test</span>x</p>')
  })
})
