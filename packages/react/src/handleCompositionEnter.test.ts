import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { UndoRedo } from '@tiptap/extensions'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { createMobileEnterPlugin } from './createMobileEnterPlugin.js'
import { flushDOMChanges } from './flushDOMChanges.js'

const ReactParagraph = Paragraph.extend({
  addNodeView() {
    return () => {
      const dom = document.createElement('p')
      const contentDOM = document.createElement('div')

      dom.dataset.nodeViewContent = ''
      contentDOM.dataset.nodeViewContentReact = ''
      dom.append(contentDOM)

      return {
        dom,
        contentDOM,
        ignoreMutation: mutation => !contentDOM.contains(mutation.target),
      }
    }
  },
})

describe('Android Enter inside a composition', () => {
  let editor: Editor

  function createEditor(content: string, position: number, paragraph = ReactParagraph) {
    vi.stubGlobal('navigator', { platform: 'Linux armv8l', userAgent: 'Android 14' })
    editor = new Editor({ extensions: [Document, paragraph, Text, UndoRedo], content })
    editor.registerPlugin(createMobileEnterPlugin(editor))
    document.body.append(editor.view.dom)
    editor.commands.setTextSelection(position)
    editor.view.focus()
  }

  function contentDOM(index = 0) {
    return editor.view.dom.querySelectorAll<HTMLElement>('[data-node-view-content-react]')[index]
  }

  function composeEnter(word: string) {
    editor.view.dom.dispatchEvent(new CompositionEvent('compositionstart'))
    editor.view.dom.dispatchEvent(
      new InputEvent('beforeinput', { inputType: 'insertCompositionText', data: `${word}\n` }),
    )
  }

  // Chrome moves the text after the caret into a copy of the content element
  function splitNatively(offset: number, index = 0, head?: string) {
    const original = contentDOM(index)
    const copy = original.cloneNode(false) as HTMLElement
    const text = original.firstChild as Text

    copy.textContent = text.data.slice(offset)
    text.data = head ?? text.data.slice(0, offset)
    original.after(copy)
  }

  async function endComposition(data: string) {
    const event = new CompositionEvent('compositionend')

    // happy-dom ignores `data` in the constructor
    Object.defineProperty(event, 'data', { value: data })
    editor.view.dom.dispatchEvent(event)
    await Promise.resolve()
  }

  afterEach(() => {
    editor?.destroy()
    document.body.replaceChildren()
    vi.unstubAllGlobals()
  })

  it('splits after the composed word and keeps the text after the caret', async () => {
    createEditor('<p>Second line of text here</p>', 12)
    composeEnter('line')
    splitNatively(11)

    await endComposition('line\n')

    expect(editor.getHTML()).toBe('<p>Second line</p><p> of text here</p>')
    expect(editor.state.selection.from).toBe(14)
    expect(editor.view.dom.querySelectorAll('[data-node-view-content-react]')).toHaveLength(2)
  })

  it('splits at the end of a paragraph', async () => {
    createEditor('<p>Hello</p>', 6)
    composeEnter('Hello')

    await endComposition('Hello\n')

    expect(editor.getHTML()).toBe('<p>Hello</p><p></p>')
    expect(editor.state.selection.from).toBe(8)
  })

  it('undoes the split in one step', async () => {
    createEditor('<p>Second line of text here</p>', 12)
    composeEnter('line')
    splitNatively(11)
    await endComposition('line\n')

    expect(editor.getHTML()).toBe('<p>Second line</p><p> of text here</p>')

    editor.commands.undo()

    expect(editor.getHTML()).toBe('<p>Second line of text here</p>')

    editor.commands.redo()

    expect(editor.getHTML()).toBe('<p>Second line</p><p> of text here</p>')
  })

  it('keeps the text after the caret when another paragraph changes during the composition', async () => {
    createEditor('<p>Other</p><p>Second line of text here</p>', 19)
    composeEnter('line')
    splitNatively(11, 1)
    flushDOMChanges(editor.view)
    // Like a collaboration update that arrives during the composition
    editor.commands.insertContentAt(6, '!')

    await endComposition('line\n')

    expect(editor.getHTML()).toBe('<p>Other!</p><p>Second line</p><p> of text here</p>')
    expect(editor.state.selection.from).toBe(22)
    expect(editor.view.dom.querySelectorAll('[data-node-view-content-react]')).toHaveLength(3)
  })

  it('keeps the text after the caret when the keyboard also corrects the word', async () => {
    createEditor('<p>Second taht of text here</p>', 12)
    composeEnter('taht')
    splitNatively(11, 0, 'Second that')

    await endComposition('that\n')

    expect(editor.getHTML()).toBe('<p>Second that</p><p> of text here</p>')
    expect(editor.state.selection.from).toBe(14)
  })

  it('splits after a word the keyboard corrects at the end of a paragraph', async () => {
    createEditor('<p>I taht</p>', 7)
    composeEnter('taht')
    ;(contentDOM().firstChild as Text).data = 'I that'

    await endComposition('that\n')

    expect(editor.getHTML()).toBe('<p>I that</p><p></p>')
    expect(editor.state.selection.from).toBe(9)
  })

  it('does not split twice at the end of a paragraph', async () => {
    createEditor('<p>Hello</p>', 6)
    composeEnter('Hello')
    editor.commands.splitBlock()

    await endComposition('Hello\n')

    expect(editor.getHTML()).toBe('<p>Hello</p><p></p>')
  })

  it('does not restore text when its paragraph is deleted during the composition', async () => {
    createEditor('<p>Other</p><p>Second line of text here</p>', 19)
    composeEnter('line')
    splitNatively(11, 1)
    flushDOMChanges(editor.view)
    editor.commands.deleteRange({ from: 7, to: editor.state.doc.content.size })

    await endComposition('line\n')

    expect(editor.getHTML()).toBe('<p>Other</p>')
  })

  it('leaves a split that is already in the document alone', async () => {
    createEditor('<p>Second line of text here</p>', 12)
    composeEnter('line')
    editor.commands.splitBlock()

    await endComposition('line\n')

    expect(editor.getHTML()).toBe('<p>Second line</p><p> of text here</p>')
  })

  it('ignores a composition that does not end with Enter', async () => {
    createEditor('<p>Second line of text here</p>', 12)
    composeEnter('line')

    await endComposition('line')

    expect(editor.getHTML()).toBe('<p>Second line of text here</p>')
  })

  it('leaves paragraphs without a React node view alone', async () => {
    createEditor('<p>Hello</p>', 6, Paragraph)
    composeEnter('Hello')

    await endComposition('Hello\n')

    expect(editor.getHTML()).toBe('<p>Hello</p>')
  })

  it('leaves desktop input alone', async () => {
    createEditor('<p>Hello</p>', 6)
    vi.stubGlobal('navigator', { platform: 'Linux x86_64', userAgent: 'Linux' })
    composeEnter('Hello')

    await endComposition('Hello\n')

    expect(editor.getHTML()).toBe('<p>Hello</p>')
  })
})
