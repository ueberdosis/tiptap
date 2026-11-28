import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import type { Node as PMNode } from '@tiptap/pm/model'
import { NodeSelection } from '@tiptap/pm/state'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { Editor } from './Editor.js'
import { Mark } from './Mark.js'
import { markPasteRule } from './pasteRules/markPasteRule.js'

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
        find: /\*(.*?)\*/g,
        type: this.type,
      }),
    ]
  },
})

const createEditorElement = () => {
  const wrapper = document.createElement('div')
  const editorElement = document.createElement('div')
  const handle = document.createElement('button')

  // The handle sits outside view.dom.parentElement once the editor is mounted
  wrapper.append(handle, editorElement)
  document.body.appendChild(wrapper)

  return { wrapper, editorElement, handle }
}

const dispatchDrop = (editor: Editor) => {
  editor.view.dom.dispatchEvent(
    new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      dataTransfer: new DataTransfer(),
    }),
  )
}

const insertDroppedBlock = (editor: Editor, block: PMNode) => {
  editor.view.dispatch(
    editor.state.tr
      .setMeta('uiEvent', 'drop')
      .insert(editor.state.doc.content.size, block.copy(block.content)),
  )
}

describe('PasteRule drop handling', () => {
  let editor: Editor
  let wrapper: HTMLElement

  afterEach(() => {
    editor?.destroy()
    wrapper?.remove()
  })

  const createEditor = () => {
    const elements = createEditorElement()
    wrapper = elements.wrapper

    editor = new Editor({
      element: elements.editorElement,
      extensions: [Document, Paragraph, Text, ItalicFromPaste],
      content: '<p>Sous *réserve* de validation</p><p>Fin</p>',
    })

    return elements
  }

  it('does not apply paste rules when a block is moved via an external drag handle', () => {
    const { handle } = createEditor()
    const block = editor.state.doc.firstChild!
    const selection = NodeSelection.create(editor.state.doc, 0)

    editor.view.dispatch(editor.state.tr.setSelection(selection))
    handle.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true }))
    editor.view.dragging = { slice: selection.content(), move: true }

    dispatchDrop(editor)
    editor.view.dispatch(
      editor.state.tr
        .setMeta('uiEvent', 'drop')
        .insert(editor.state.doc.content.size, block.copy(block.content))
        .delete(selection.from, selection.to),
    )

    expect(editor.getHTML()).toBe('<p>Fin</p><p>Sous *réserve* de validation</p>')
  })

  it('does not apply paste rules when a block is copied via an external drag handle', () => {
    const { handle } = createEditor()
    const block = editor.state.doc.firstChild!
    const selection = NodeSelection.create(editor.state.doc, 0)

    editor.view.dispatch(editor.state.tr.setSelection(selection))
    handle.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true }))
    editor.view.dragging = { slice: selection.content(), move: false }

    dispatchDrop(editor)
    insertDroppedBlock(editor, block)

    expect(editor.getHTML()).toBe(
      '<p>Sous *réserve* de validation</p><p>Fin</p><p>Sous *réserve* de validation</p>',
    )
  })

  it('still applies paste rules to content dropped from outside the editor', () => {
    createEditor()
    const block = editor.state.doc.firstChild!

    expect(editor.view.dragging).toBeNull()

    dispatchDrop(editor)
    insertDroppedBlock(editor, block)

    expect(editor.getHTML()).toBe(
      '<p>Sous *réserve* de validation</p><p>Fin</p><p>Sous <em>réserve</em> de validation</p>',
    )
  })
})
