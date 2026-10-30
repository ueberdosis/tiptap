import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { NodeSelection } from '@tiptap/pm/state'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { Editor } from './Editor.js'
import { Mark } from './Mark.js'
import { markPasteRule } from './pasteRules/markPasteRule.js'

const pasteRegex = /\*(.*?)\*/g
const editorElClass = 'tiptap-external-drag-paste-rule-test'

const ItalicFromPaste = Mark.create({
  name: 'italicFromPaste',
  parseHTML() {
    return [{ tag: 'em' }]
  },
  renderHTML() {
    return ['em', 0]
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

const createEditorEl = () => {
  const wrapper = document.createElement('div')
  wrapper.classList.add(editorElClass)

  const editorEl = document.createElement('div')
  const handle = document.createElement('button')
  handle.type = 'button'
  handle.classList.add('external-drag-handle')

  // Handle sits beside the editor element, outside view.dom.parentElement once mounted.
  wrapper.append(handle, editorEl)
  document.body.appendChild(wrapper)

  return { wrapper, editorEl, handle }
}

describe('PasteRule external drag handle', () => {
  let editor: Editor
  let wrapper: HTMLElement

  afterEach(() => {
    editor?.destroy()
    wrapper?.remove()
  })

  it('does not apply paste rules when a block is moved via an external drag handle', () => {
    const els = createEditorEl()
    wrapper = els.wrapper

    editor = new Editor({
      element: els.editorEl,
      extensions: [Document, Paragraph, Text, ItalicFromPaste],
      content: '<p>Sous *réserve* de validation</p><p>Fin</p>',
    })

    const before = editor.getHTML()
    const firstBlock = editor.state.doc.firstChild
    expect(firstBlock).toBeTruthy()

    // Select the first paragraph like an external drag handle would.
    const selection = NodeSelection.create(editor.state.doc, 0)
    editor.view.dispatch(editor.state.tr.setSelection(selection))

    // Drag starts on the handle outside editor.view.dom.parentElement.
    els.handle.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true }))

    // Simulate a same-editor move drop with a ProseMirror slice payload.
    const dataTransfer = new DataTransfer()
    dataTransfer.setData('text/html', '<p data-pm-slice="1 1 []">Sous *réserve* de validation</p>')
    editor.view.dragging = {
      slice: selection.content(),
      move: true,
    }

    editor.view.dom.dispatchEvent(
      new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      }),
    )

    // Insert at the document end (block boundary), then delete the source.
    const insertPos = editor.state.doc.content.size
    editor.view.dispatch(
      editor.state.tr
        .setMeta('uiEvent', 'drop')
        .insert(insertPos, firstBlock!.copy(firstBlock!.content))
        .delete(selection.from, selection.to),
    )

    // Paste rules must not turn *réserve* into a mark on an internal move.
    expect(editor.getHTML()).not.toContain('<em>')
    expect(editor.getHTML()).toContain('*réserve*')
    // Full document: original second paragraph first, moved block after it.
    expect(editor.getHTML()).toBe('<p>Fin</p><p>Sous *réserve* de validation</p>')
    expect(editor.getText()).toContain('Sous *réserve* de validation')
    expect(before).toContain('*réserve*')
  })
})
