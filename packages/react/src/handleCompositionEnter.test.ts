import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { UndoRedo } from '@tiptap/extensions'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { createMobileEnterPlugin } from './createMobileEnterPlugin.js'

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

  function contentDOM() {
    return editor.view.dom.querySelector<HTMLElement>('[data-node-view-content-react]')!
  }

  function composeEnter(word: string) {
    editor.view.dom.dispatchEvent(new CompositionEvent('compositionstart'))
    editor.view.dom.dispatchEvent(
      new InputEvent('beforeinput', { inputType: 'insertCompositionText', data: `${word}\n` }),
    )
  }

  // Chrome moves the text after the caret into a copy of the content element
  function splitNatively(offset: number) {
    const original = contentDOM()
    const copy = original.cloneNode(false) as HTMLElement
    const text = original.firstChild as Text

    copy.textContent = text.data.slice(offset)
    text.deleteData(offset, text.data.length - offset)
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
