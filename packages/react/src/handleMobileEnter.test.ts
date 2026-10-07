import { Editor, type EditorOptions } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { handleMobileEnter } from './handleMobileEnter.js'

vi.hoisted(() => {
  Object.defineProperty(navigator, 'userAgent', {
    configurable: true,
    value: 'Mozilla/5.0 (Linux; Android 14) Chrome/140.0.0.0',
  })
})

describe('handleMobileEnter', () => {
  let editor: Editor

  function createEditor(options: Partial<EditorOptions> = {}) {
    vi.stubGlobal('navigator', { platform: 'Android', userAgent: 'Android 14' })
    editor = new Editor({
      extensions: [
        Document,
        Paragraph.extend({
          addNodeView() {
            return () => {
              const dom = document.createElement('p')

              dom.dataset.nodeViewContentReact = ''
              return {
                dom,
                contentDOM: dom,
                ignoreMutation: mutation => mutation.type === 'attributes',
              }
            }
          },
        }),
        Text,
        HardBreak,
      ],
      content: '<p>Hello</p>',
      ...options,
    })
    document.body.append(editor.view.dom)
    const contentDOM = editor.view.dom.firstElementChild as HTMLElement

    editor.commands.setTextSelection(6)
    editor.view.focus()

    return contentDOM
  }

  function beforeInput(options: InputEventInit = {}) {
    const event = new InputEvent('beforeinput', {
      inputType: 'insertParagraph',
      cancelable: true,
      ...options,
    })

    handleMobileEnter(editor, event)
    return event
  }

  afterEach(() => {
    editor?.destroy()
    document.body.replaceChildren()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  function queueSelectionChange(contentDOM: HTMLElement) {
    const view = editor.view as typeof editor.view & {
      domObserver: { flush: () => void; onSelectionChange: () => void }
    }

    view.domObserver.flush()
    // Keep happy-dom's synchronous selectionchange pending until beforeinput.
    document.removeEventListener('selectionchange', view.domObserver.onSelectionChange)
    document.getSelection()!.collapse(contentDOM.firstChild!, 3)
    view.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 }))
  }

  it.each([
    ['insertParagraph', '<p>Hel</p><p>lo</p>', 6],
    ['insertLineBreak', '<p>Hel<br>lo</p>', 5],
  ])('handles %s once at the pending DOM caret', (inputType, html, position) => {
    const contentDOM = createEditor()

    queueSelectionChange(contentDOM)

    expect(editor.state.selection.from).toBe(6)
    expect(beforeInput({ inputType }).defaultPrevented).toBe(true)
    expect(editor.getHTML()).toBe(html)
    expect(editor.state.selection.from).toBe(position)
  })

  it('calls custom Enter handlers once with the updated selection', () => {
    const handleKeyDown = vi.fn(view => {
      expect(view.state.selection.from).toBe(4)
      return true
    })
    const contentDOM = createEditor({ editorProps: { handleKeyDown } })

    queueSelectionChange(contentDOM)

    expect(beforeInput().defaultPrevented).toBe(true)
    expect(handleKeyDown).toHaveBeenCalledTimes(1)
  })

  it('preserves native Enter detection when no handler accepts it', () => {
    const contentDOM = createEditor({ enableCoreExtensions: { keymap: false } })
    const view = editor.view as typeof editor.view & { input: { lastKeyCode: number | null } }

    queueSelectionChange(contentDOM)

    expect(beforeInput().defaultPrevented).toBe(false)
    expect(view.input.lastKeyCode).toBe(13)
    expect(editor.state.selection.from).toBe(4)
    expect(editor.getHTML()).toBe('<p>Hello</p>')
  })

  it('commits pending DOM text and selection before splitting', () => {
    const contentDOM = createEditor()
    const text = contentDOM.firstChild!

    text.textContent = 'Hello world'
    document.getSelection()!.collapse(text, 11)

    expect(beforeInput().defaultPrevented).toBe(true)
    expect(editor.getHTML()).toBe('<p>Hello world</p><p></p>')
    expect(editor.state.selection.from).toBe(14)
  })

  it('preserves pending composition text when Enter arrives before compositionend', () => {
    const contentDOM = createEditor()
    const text = contentDOM.firstChild!

    editor.view.dispatchEvent(new CompositionEvent('compositionstart'))
    text.textContent = 'Hello world'
    document.getSelection()!.collapse(text, 11)

    expect(beforeInput({ isComposing: true }).defaultPrevented).toBe(true)
    editor.view.dispatchEvent(new CompositionEvent('compositionend', { data: 'world' }))
    editor.commands.insertContent('Next')

    expect(editor.getHTML()).toBe('<p>Hello world</p><p>Next</p>')
    expect(editor.state.selection.from).toBe(18)
  })

  it.each([
    ['insertParagraph', false],
    ['insertLineBreak', true],
  ])('uses custom keyboard handlers for %s', (inputType, shiftKey) => {
    const handleKeyDown = vi.fn(() => true)

    createEditor({ editorProps: { handleKeyDown } })

    expect(beforeInput({ inputType }).defaultPrevented).toBe(true)
    expect(handleKeyDown).toHaveBeenCalledWith(
      editor.view,
      expect.objectContaining({ key: 'Enter', keyCode: 13, shiftKey }),
    )
    expect(editor.getHTML()).toBe('<p>Hello</p>')
  })

  it('allows native input when no keyboard handler accepts Enter', () => {
    createEditor({ enableCoreExtensions: { keymap: false } })

    expect(beforeInput().defaultPrevented).toBe(false)
    expect(editor.getHTML()).toBe('<p>Hello</p>')
  })

  it.each([{ cancelable: false }, { inputType: 'insertText' }])(
    'leaves unrelated or noncancelable input alone: %j',
    options => {
      createEditor()

      expect(beforeInput(options).defaultPrevented).toBe(false)
      expect(editor.getHTML()).toBe('<p>Hello</p>')
    },
  )

  it('respects an already handled event', () => {
    createEditor()
    const event = new InputEvent('beforeinput', { inputType: 'insertParagraph', cancelable: true })

    event.preventDefault()
    handleMobileEnter(editor, event)

    expect(editor.getHTML()).toBe('<p>Hello</p>')
  })

  it('leaves desktop input alone', () => {
    createEditor()
    vi.stubGlobal('navigator', { platform: 'Linux', userAgent: 'Linux' })

    expect(beforeInput().defaultPrevented).toBe(false)
    expect(editor.getHTML()).toBe('<p>Hello</p>')
  })

  it('leaves ordinary paragraphs alone', () => {
    const contentDOM = createEditor()

    delete contentDOM.dataset.nodeViewContentReact

    expect(beforeInput().defaultPrevented).toBe(false)
    expect(editor.getHTML()).toBe('<p>Hello</p>')
  })

  it('leaves read-only editors alone', () => {
    createEditor()
    editor.setEditable(false)

    expect(beforeInput().defaultPrevented).toBe(false)
    expect(editor.getHTML()).toBe('<p>Hello</p>')
  })
})
